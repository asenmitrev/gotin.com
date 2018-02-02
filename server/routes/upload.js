var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/users');
var fs = require('fs');
var multiparty = require('connect-multiparty');

var multipartyMiddleware = multiparty();
var tokenVerificationMiddleware = require('../helpers/token-verification-middleware');

router.post('/cover', tokenVerificationMiddleware, multipartyMiddleware, function (req, res) {
    var file = req.files.file;

});

router.post('/avatar', tokenVerificationMiddleware, multipartyMiddleware, function (req, res) {
    var file = req.files.file;

    User.findOne({ _id: req.user._id }).exec(function (err, user) {
        if (err)
            return res.status(500).json({ error: err });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        } else {
        }
    });
});

module.exports = router;