var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var levelConfig = require('../config/level-config');
var bCrypt = require('bcrypt-nodejs');
var Notification = require('./notifications');
var socketManager = require('../helpers/socket-manager');
var Q = require('q');

var autofollowedUsers = [
    'Пенчо Славейков', 
    'WriteCraftTeam'
];

var UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String },
    displayName: String,
    dailyPoints: Number,
    gotinCount: { type: Number, default: 0 },
    superbanned: {type:Boolean, default:false},
    title: String,
    signature: String,
    unreadNotificationCount: Number,
    banned: [
        { type: Schema.ObjectId, ref: 'users', default: [] }
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    facebookId: String,
    isAdmin: Boolean,
    postedOn: { type: Date, default: Date.now, index: true }
});

UserSchema.methods.increaseLevel = function () {
    var self = this;
    self.level++;

    self.addNotification({
        type: 'level-up',
        body: {
            level: self.level
        }
    });
};

UserSchema.methods.updateTitle = function updateTitle() {
    var self = this;
    var prevTitle = self.title;
    self.title = 'New title';

    self.addNotification({
        type: 'new-title',
        body: {
            title: self.title
        }
    });
};

UserSchema.methods.isValidPassword = function (password) {
    return bCrypt.compareSync(password, this.password);
};

UserSchema.methods.addNotification = function (data) {
    var self = this;
    setTimeout(function () {
        var newNotification = new Notification(data);
        newNotification.onUser = self;

        newNotification.save(function (err, notif) {
            socketManager.sendNewNotificationToUser(self._id, notif);
        });

    }, 0);
};

//Remove password hash from all user objects when passing to client
UserSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        delete ret.password;
        return ret;
    }
});

module.exports = mongoose.model('users', UserSchema);