var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var async = require('async');
var User = require('../models/users'); 
var Room = mongoose.model('rooms');
var Message = mongoose.model('messages');
var levelConfig = require('../config/level-config');

var gigabanned = levelConfig.gigabanned; 
var tokenVerificationMiddleware = require('../helpers/token-verification-middleware');

router.get('', tokenVerificationMiddleware, function (req, res) {
    Room.find({ participants: req.user._id })
        .sort({ 'lastMessage': -1 })
        .populate('participants')
        .populate('lastMessage')
        .exec(function (err, rooms) {
            if (err) {
                return res.status(500).json({ status: 'error', error: err, message: 'An error occurred.' });
            }
            var roomsJson = [];
            for (var i in rooms) {
                var room = rooms[i].toObject();
                for (var j in room.participants) {
                    if (room.participants[j]._id && !room.participants[j]._id.equals(req.user._id)) {
                        room.correspondent = room.participants[j];
                    }
                }
                roomsJson.push(room);
            }
            return res.status(200).json({ status: 'success', rooms: roomsJson });
        });
});

router.get('/rooms/:roomId', tokenVerificationMiddleware, function (req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.roomId)) {
        return res.status(404).json({ status: 'error', message: 'Conversation doesn\'t  exist.' });
    }
    //TODO check if user is in room
    var aggregation = Message.aggregate([
        {
            $match: { roomId: req.params.roomId.toObjectId() }
        },
        {
            $sort: { postedOn: -1 }
        },
        { 
            $skip: parseInt(req.query.skip)
        },
        {
            $limit: parseInt(req.query.limit)
        }
    ]);

    aggregation
        .exec(function (err, messages) {
            if (err) {
                return res.status(500).json({ status: 'error', error: err, message: 'An error occurred.' });
            }
            messages.reverse();

            Message.populate(messages, { path: 'author' }, function () {
                return res.json(messages);
            });
        });
});

router.post('/rooms/:roomId', tokenVerificationMiddleware, function (req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.roomId)) {
        return res.status(404).json({ status: 'error', message: 'Conversation doesn\'t  exist.' });
    }

    Room.findOne({_id: req.params.roomId}, function(err,room){
        
        var banned  = false;
            User.findOne({ _id: room.participants[0] }, function (err, user) {
                
                User.findOne({ _id: room.participants[1] }, function (err, userTwo) {
                    
                    if(user.banned.indexOf(room.participants[1])>-1)
                    {
                        return res.status(404).json({status: 'error', message: "User banned you"});
                    }
                    else if(userTwo.banned.indexOf(room.participants[0])>-1)
                    {
                        return res.status(404).json({status: 'error', message: "User banned you"});
                    }
                    else if(user.superbanned || userTwo.superbanned){
                        return res.status(404).json({status: 'error', message: "User banned you"});
                    }
                    else if(gigabanned.indexOf(req.headers['x-forwarded-for'])>-1)
                    {
                        return res.status(404).json({ status: 'error', message: 'The user banned you.' });
                    }
                    else
                    {
                        var newMessage = new Message({
                            content: req.body.message,
                            author: req.user._id,
                            roomId: req.params.roomId
                        });

                        newMessage.save(function (err, message) {
                            Message.populate(message, { path: 'author' }, function (err, message) {
                                return res.json({ status: 'success', message: message });
                            });
                        });
                    }
                });

            });
    
    })
});

router.post('/:userId', tokenVerificationMiddleware, function (req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
        return res.status(404).json({ status: 'error', message: 'User doesn\'t  exist.' });
    }

    User.findOne({ _id: req.params.userId }, function (err, user) { 
        User.findOne({ _id: req.user._id }, function (err, userTwo) { 
            if(user.banned.indexOf(userTwo._id)>-1 || userTwo.banned.indexOf(user._id)>-1 || user.suuperbanned || userTwo.superbanned){
                return res.status(404).json({status: 'error', message: "User banned you"});
            }
            if(gigabanned.indexOf(req.headers['x-forwarded-for'])>-1)
            {
                return res.status(404).json({ status: 'error', message: 'The user banned you.' });
            }
            
            async.parallel([
                function (callback) {
                    User.findOne({ _id: req.params.userId }, function (err, user) {
                        if (err) {
                            return callback(err);
                        }
                        callback(null, user);
                    });
                },
                function (callback) {
                    Room.findOne({ $and: [{ participants: req.params.userId }, { participants: req.user._id }] })
                        .exec(function (err, room) {
                            if (err) {
                                callback(err);
                            }
                            callback(null, room);
                        });
                },
            ], function (err, results) {
                if (err) {
                    return res.status(500).json({ status: 'error', error: err, message: 'An error occurred.' });
                }

                var receiver = results[0];
                if (!receiver) {
                    return res.status(404).json({ status: 'error', message: 'User doesn\'t  exist.' });
                }

                var room = results[1];
                if (room) {
                    var newMessage = new Message({
                        content: req.body.message,
                        author: req.user._id,
                        roomId: room._id
                    });
                    newMessage.save(function (err, message) {
                        return res.json({ status: 'success', message: 'Message sent.', roomId: room._id });
                    });
                } else {
                    var newRoom = new Room({
                        participants: [
                            req.user._id,
                            receiver._id
                        ]
                    });

                    newRoom.save(function (err, room) {
                        if (err) {
                            return res.status(500).json({ status: 'error', error: err, message: 'An error occurred.' });
                        }
                        var newMessage = new Message({
                            content: req.body.message,
                            author: req.user._id,
                            roomId: room._id
                        });

                        newMessage.save(function (err, message) {
                            return res.json({ status: 'success', message: 'Message sent.', roomId: room._id });
                        });
                    });
                }
                
                });
            })    
    }) 
});

module.exports = router;