var socketioJwt = require('socketio-jwt');
var SALT = require('../config/jwt-salt');

var connectedUsers = {}, io;

module.exports = {
    init: init,
    sendNewNotificationToUser: sendNewNotificationToUser,
    sendNewMessageToUser: sendNewMessageToUser,
    isUserInRoom: isUserInRoom
};


function init(socket) {
    io = socket;

    io.use(socketioJwt.authorize({
        secret: SALT,
        handshake: true
    }));

    io.on('connection', function (client) {
        connectedUsers[client.decoded_token._id] = client;
        client.join(client.decoded_token._id);

        client.on('disconnect', function () {
            delete connectedUsers[client.decoded_token._id];
        });

        client.on('join_room', function (roomId) {
            client.join(roomId);
        });

        client.on('leave_room', function (roomId) {
            client.leave(roomId);
        });
    });
}

function sendNewNotificationToUser(userId, notification) {
    io.to(userId).emit('new_notification', notification);
}

function sendNewMessageToUser(userId, message) {
    io.to(userId).emit('new_message', message);
}

function isUserInRoom(userId, roomId) {
    if (connectedUsers[userId]) {
        return roomId in connectedUsers[userId].rooms;
    }
}