var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RoomSchema = new Schema({
    participants: [{
        type: Schema.ObjectId,
        ref: 'users',
        required: [true, 'Room must have participants.']
    }],
    lastMessage: {
        type: Schema.ObjectId,
        ref: 'messages'
    }
});

module.exports = mongoose.model('rooms', RoomSchema);