var jwt = require('jsonwebtoken');
var SALT = require('../config/jwt-salt'); // secret variable

module.exports = function tokenDecoder(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, SALT, function (err, decoded) {
            if (!err) {
                req.user = decoded;
            }
            next();
        });
    } else {
        next();
    }

};