var mongoose = require('mongoose');
var Room = mongoose.model('rooms');
var Schema = mongoose.Schema;
var socketManager = require('../helpers/socket-manager');

var Notification = require('./notifications');

var MessageSchema = new Schema({
    roomId: {
        type: Schema.ObjectId,
        ref: 'rooms',
        index: true,
        required: [true, 'Message must have a room.']
    },
    author: {
        type: Schema.ObjectId,
        ref: 'users'
    },
    content: String,
    postedOn: { type: Date, default: Date.now }
});

//Below function is executed before every message is saved
MessageSchema.pre('save', function (next) {
    var self = this;

    Room.findOne({ _id: self.roomId }).populate('participants').exec(function (err, room) {
        if (!room) {
            return console.error('Room doesn\'t exist');
        }
        if (!room.participants) {
            return console.error('Room without participants');
        }

        self.constructor.populate(self, { path: 'author' }, function () {

            //Notify room participants
            //TODO skip notification if user is currently in room
            //Some socket magic is required for the last one
            room.participants.forEach(function (user) {
                if (socketManager.isUserInRoom(user._id, room._id)) {
                    //if the user is currently viewing the chat, no need to add notification
                    socketManager.sendNewMessageToUser(user._id, self);
                    return;
                }

                if (!user._id.equals(self.author._id)) {

                    Notification.findOne({ type: 'new-message', onUser: user, byUser: self.author, isRead: false })
                        .exec(function (err, oldNotification) {
                            if (!oldNotification) {
                                user.addNotification({
                                    type: 'new-message',
                                    body: {
                                        room: { _id: room._id }
                                    },
                                    byUser: self.author
                                });
                            }
                        });
                }
            });
        });

        //update the last message for the room
        room.lastMessage = self._id;
        room.save();
    });

    next();
});

module.exports = mongoose.model('messages', MessageSchema);