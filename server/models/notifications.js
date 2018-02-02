var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationSchema = new Schema({
    //notification body is used to pass any information needed by the notification
    body: {},
    type: {
        type: String
    },
    onUser: {
        type: Schema.ObjectId,
        ref: 'users',
        index: true,
        required: [true, 'Notification must be on user.']
    },
    byUser: {
        type: Schema.ObjectId,
        ref: 'users'
    },
    isRead: { type: Boolean, default: false, index: true },
    postedOn: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('notifications', NotificationSchema);
