var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/users');
    
var SALT = require('../config/jwt-salt'); // secret variable
var jwt = require('jsonwebtoken');
var async = require('async');
var request = require('request');
var Notification = mongoose.model('notifications');
var bCrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var mailer = require('../helpers/mailer');
var FB = require('fb');

var secretCaptchaKey = '6LfWYSQTAAAAABnpIyt7jnPYkScM76Cly-mOx22r';
var projections = require('../config/projections');
var tokenVerificationMiddleware = require('../helpers/token-verification-middleware');
var levelConfig = require('../config/level-config');
var facebookConfig = require('../config/facebook');


router.post('/login', function (req, res) { 
    var loginData = req.body;
    User.findOne({ $or: [{ 'email': loginData.email }, { 'username': loginData.email }] }).exec(
        function (err, user) {
            if (err)
                return res.status(500).json({ error: err });
            if (!user) {
                return res.status(404).json({ message: 'Wrong email or password.' });
            } else {
                if (!user.isValidPassword(loginData.password)) {
                    return res.status(401).json({ message: 'Wrong email or password.' });
                } else {
                    var userObj = {
                        _id: user._id,
                        username: user.username,
                        isAdmin: user.isAdmin
                    };
                    // if user is found and password is right
                    // create a token
                    var token = jwt.sign(userObj, SALT, {
                        expiresIn: '148h' // expires in 24 hours
                    });

                    // return the information including token as JSON
                    res.json({ user: user, token: token });
                }
            }
        });
});

router.post('/register', function (req, res) {
    // if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
    //     return res.status(401).json({ message: 'Please select captcha' });
    // } 

    //NE RABOTI zabranata na gigabannati da regvat. Trqq se oprai nqkoga 
    if(levelConfig.gigabanned.indexOf(req.headers['x-forwarded-for'])>-1) return res.status(404).json({ status: 'error', message: 'Connection error' }); 
    
    // var verificationUrl = 'https://www.google.com/recaptcha/api/siteverify?secret=' + secretCaptchaKey + '&response=' + req.body['g-recaptcha-response'] + '&remoteip=' + req.connection.remoteAddress;
    // Hitting GET request to the URL, Google will respond with success or error scenario.
    // request(verificationUrl, function (error, response, body) {
    //     if(error) console.error(error);
    //     body = JSON.parse(body);
    //     if (body.success !== undefined && !body.success) {
    //         return res.status(401).json({ message: 'Failed captcha verification' });
    //     }
        var registerData = req.body;

        async.parallel([
            function (callback) {
                User.findOne({ 'username': registerData.username }).exec(function (err, user) {
                    if (err) {
                        callback(err);
                        return;
                    }
                    if (user) {
                        callback({ message: 'Username already exists.' });
                        return;
                    }
                    callback();
                });
            }
        ],
        function (err) {
            if (err) {
                res.status(500).json({ message: err.message });
                return;
            }
            var newUser = new User();
            newUser.username = registerData.username;
            newUser.password = createHash(registerData.password);
            newUser.displayName = registerData.displayName;
            newUser.updateTitle(); //sets default characteristic
            newUser.save(function (err) {
                if (err) {
                    res.status(500).json({ error: err, message: err.message });
                    return;
                }
                //turn user to object from Mongoose document
                var userObj = {
                    _id: newUser._id,
                    username: newUser.username,
                    isAdmin: newUser.isAdmin
                };
                // if user is found and password is right
                // create a token
                var token = jwt.sign(userObj, SALT, {
                    expiresIn: '148h' // expires in 148 hours
                });
                
                // return the information including token as JSON
                return res.json({ user: user, token: token });
            });
        });
    // });
});

router.post('/facebook-login', function (req, res) {

    async.parallel([
        function (callback) {
            //check if a user with this facebook ID exists
            User.findOne({ 'facebookId': req.body.authResponse.userID }).exec(function (err, user) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(err, user);
            });
        },
        function (callback) {
            //Check if the access token provided is valid
            FB.api(
                '/me?access_token=' + req.body.authResponse.accessToken + '&fields=id,name,email,first_name,last_name,picture.type(large)',
                function (response) {
                    if (response && !response.error) {
                        return callback(null, response);
                    }
                    callback(response.error);
                }
            );
        }
    ],
        function (err, results) {
            if (err) {
                return res.status(500).json({ message: 'An error occurred', error: err });
            }
            var user = results[0];
            var fbResponse = results[1];

            if (user) {
                //login successful
                var userObj = {
                    _id: user._id,
                    username: user.username,
                    isAdmin: user.isAdmin
                };
                // if user is found and password is right
                // create a token
                var token = jwt.sign(userObj, SALT, {
                    expiresIn: '148h' // expires in 148 hours
                });

                // return the information including token as JSON
                return res.json({ user: user, token: token });
            }

            if (!user) {
                //register the new user
                var newUser = new User();
                newUser.username = fbResponse.name;
                newUser.password = createHash('facebook');
                newUser.email = fbResponse.email;
                newUser.avatar = fbResponse.picture.data.url;
                newUser.firstName = fbResponse.first_name;
                newUser.lastName = fbResponse.last_name;
                newUser.facebookId = fbResponse.id;
                newUser.save(function (err) {
                    if (err) {
                        res.status(500).json({ error: err, message: err.message });
                        return;
                    }
                    var userObj = {
                        _id: newUser._id,
                        username: newUser.username,
                        isAdmin: newUser.isAdmin
                    };
                    // create a token
                    var token = jwt.sign(userObj, SALT, {
                        expiresIn: '148h' // expires in 148 hours
                    });
                    
                    // return the information including token as JSON
                    return res.json({ user: user, token: token });
                });
                return;
            }

            return res.status(404).json({ message: 'What?' });
        }
    );
});


router.post('/forgot-password', function (req, res) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    return res.status(401).json({ message: 'No account with that email address exists.' });
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            var mailOptions = {
                to: user.email,
                from: '"WriteCraft Team" <asen@writecraft.io>',
                subject: 'WriteCraft Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset-password/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };

            mailer.sendMail(mailOptions, function (err) {
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err)
            return res.status(500).json({ message: 'An error occurred.', error: err });

        res.json({ message: 'A reset link has been sent to your e-mail.' });
    });
});

router.get('/verify-password-token/:token', function (req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
            return res.status(401).json({ message: 'Password reset token is invalid or has expired.' });
        }

        res.sendStatus(200);
    });
});

router.post('/verify-password-token/:token', function (req, res) {
    var userData = req.body;
    if(!userData.password) return res.status(404).json({ message: 'Password not included with response.'})

    async.waterfall([
        function (done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                if (!user) {
                    return res.status(401).json({ message: 'Password reset token is invalid or has expired.' });
                }
                user.password = createHash(userData.password);
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err){
                    done(err, user);
                });
            });
        },
        function (user, done) {
            var mailOptions = {
                to: user.email,
                from: '"WriteCraft Team" <asen@writecraft.io>',
                subject: 'Your password has been reset',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account at WriteCraft has just been changed.\n'
            };

            mailer.sendMail(mailOptions, function (err) {
                done(err);
            });

            user.addNotification({
                type: 'password-reset'
            });
        }
    ], function (err) {
        if (err)
            return res.status(500).json({ message: 'An error occurred.', error: err });

        res.json({ message: 'Your password has been reset.' });
    });
});


router.get('/notifications', tokenVerificationMiddleware, function (req, res) {
    var notifications = Notification.aggregate(
        [
            {
                $match: { onUser: req.user._id.toObjectId() }
            },
            {
                $sort: { isRead: 1, postedOn: -1 }
            },
            {
                $skip: parseInt(req.query.skip)
            },
            {
                $limit: parseInt(req.query.limit)
            }
        ]
    );

    notifications.exec(function (err, notifications) {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        for (var i = 0; i < notifications.length; i++) {
            Notification.findOne({ _id: notifications[i]._id }, function (err, notification) {
                //this does not slow down request
                notification.isRead = true;
                notification.save();
            });
        }

        Notification.populate(notifications, [{ path: 'byUser', select: projections.userPreviewProjection },
        { path: 'post', select: projections.notificationPostProjection }, { path: 'forumPost', select: projections.notificationForumPostProjection }], function (err, notifications) {
            res.status(200).json(notifications);
        });
    });
});

router.get('/notifications/count', tokenVerificationMiddleware, function (req, res) {
    //not logged in user
    //no user
    //invalid id
    Notification.find({ onUser: req.user._id, isRead: false })
        .exec(function (err, notifications) {
            if (err) {
                return res.json({ status: 'error', error: err, message: 'An error occurred.' });
            }
            res.status(200).json(notifications.length);
        });
});

router.get('/:username/userid', function (req, res) {
    User.findOne({ username: req.params.username }, { _id: 1 }, function (err, user) {
        if (err) {
            return res.json({ status: 'error', error: err, message: 'An error occurred.' });
        }
        res.json(user);
    });
});

router.get('/profile', tokenVerificationMiddleware, function (req, res) {
    User.findOne({ _id: req.user._id }).exec(function (err, user) {
        if (err) {
            return res.status(500).json({ status: 'error', error: err, message: 'An error occurred.' });
        }
        res.status(200).json(user);
    });
}); 

router.get('', function(req,res){
    var aggregationOperators = [];

    if (req.query.sort && req.query.sort == 'level') { 
        aggregationOperators.unshift({ $sort: { level: -1, experience: -1 } }); 
        aggregationOperators.unshift({ $match: {bot:{$exists:false} } });
    } else if (req.query.sort && req.query.sort == 'critic') { 
        aggregationOperators.unshift({ $sort: { critiqueExperience: -1, _id: -1 } });
    } else if (req.query.sort && req.query.sort == 'username') {
        var re = new RegExp(req.query.name, 'ig'); 
        aggregationOperators.unshift({ $match: { $or: [{ username: re }, { displayName: re }]} });
    }
    else {
        //sort by ObjectId by default
        aggregationOperators.unshift({ $sort: { _id: -1 } });
    }

    aggregationOperators.push({ $project: projections.userPreviewProjection });
    
    if (req.query.skip && req.query.limit) {
        aggregationOperators.push({ $skip: parseInt(req.query.skip) });
        aggregationOperators.push({ $limit: parseInt(req.query.limit) });
    } 

    var usersAggregation = User.aggregate(aggregationOperators);

    usersAggregation.exec(function (err, users) {
        if (err)
            return res.status(500).json({ message: 'Server Error.', error: err });

        res.status(200).json(users);
    });
});

router.get('/gotin/week', (req, res) => {
    User.findOne({ username: 'asen'}).exec((err, useer) => {
        res.json(useer);
    })
});

router.put('/profile', tokenVerificationMiddleware, function (req, res) {
    User.findOne({ _id: req.user._id }).exec(function (err, user) {
        if (err)
            return res.status(500).json({ error: err });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        } else {
            user.displayName = req.body.displayName ? req.body.displayName : user.displayName;
            if (req.body.customTitle) {
                if (user.collectedTitles.indexOf(req.body.customTitle) > -1) {
                    user.customTitle = req.body.customTitle;
                }
            }

            user.about = req.body.about ? req.body.about : user.about;
            user.signature = req.body.signature ? req.body.signature.substr(0, 139) : user.signature;

            user.feeds.followedBool = req.body.feeds.followedBool;
            user.feeds.forumBool = req.body.feeds.forumBool;
            user.feeds.newestBool = req.body.feeds.newestBool;
            user.feeds.duelBool = req.body.feeds.duelBool;

            user.paypal = req.body.paypal;
            user.acceptsPayment = req.body.acceptsPayment;  

            user.save(function (err, user) {
                if (err)
                    return res.status(500).json({ error: err });

                res.json({ user: user });
            });

        }
    });
});

router.put('/profile/password', tokenVerificationMiddleware, function (req, res) {
    User.findOne({ _id: req.user._id }).exec(function (err, user) {
        if (err)
            return res.status(500).json({ error: err });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        } else {
            if (!user.isValidPassword(req.body.oldPassword)) {
                return res.status(401).json({ message: 'Oops. Password is not correct.' });
            } else {
                user.displayName = req.body.displayName ? req.body.displayName : user.displayName;
                if (req.body.customTitle) {
                    if (user.collectedTitles.indexOf(req.body.customTitle) > -1) {
                        user.customTitle = req.body.customTitle;
                    }
                }
                user.about = req.body.about ? req.body.about : user.about;
                user.signature = req.body.signature ? req.body.signature.substr(0, 139) : user.signature;
                if (req.body.password && req.body.confirmPassword && req.body.password == req.body.confirmPassword) {
                    user.password = createHash(req.body.password);
                }

                user.save(function (err, user) {
                    if (err)
                        return res.status(500).json({ error: err });

                    res.json({ user: user });
                });
            }
        }
    });
});


router.get('/:userId', function (req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
        return res.status(404).json({ status: 'error', message: 'User doesn\'t  exist.' });
    }

    User.findOne({ _id: req.params.userId }).exec(function (err, user) {
        if (err) {
            return res.status(500).json({ status: 'error', error: err, message: 'An error occurred.' });
        }
        res.status(200).json(user);
    });
});

router.post('/:userId/bann', tokenVerificationMiddleware, function(req,res){
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
        return res.status(404).json({ status: 'error', message: 'User doesn\'t  exist.' });
    }
    if (req.user._id == req.params.userId) {
        return res.status(401).json({ status: 'error', message: 'Cannot ban yourself.' });
    }
    async.auto({
        userToBan: (callback) => { 
            User.findOne({ _id: req.params.userId }).exec(callback);
        },
        userWhoBans: (callback) => {
            User.findOne({_id: req.user._id}).exec(callback);
        }
    }, (err, results) => {
        if (err) {
            return res.status(500).json({ status: 'error', error: err, message: 'An error occurred.' });
        }
        var reggedUser = results.userWhoBans;
        var user = results.userToBan;
        
        if(reggedUser.banned.indexOf(user._id)>-1)
        {            
            reggedUser.banned.splice(reggedUser.banned.indexOf(user._id),1);
        }
        else{
            reggedUser.banned.push(user._id);
        }
        
        reggedUser.save();
        res.sendStatus(200); 
    })
})

module.exports = router;

function createHash(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}