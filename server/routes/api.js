var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/users');
var ContactForm = mongoose.model('contact-form');
var mailer = require('../helpers/mailer');

var tokenVerificationMiddleware = require('../helpers/token-verification-middleware');

var usersRoutes = require('./users');
var uploadRoutes = require('./upload');
var messagesRoutes = require('./messages');

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8080");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
    next();
});

router.use('/users', usersRoutes);

router.use('/upload', uploadRoutes);

router.use('/messages', messagesRoutes);

router.get('/', function (req, res) {
    return res.sendStatus(200);
});



router.get('/verifytoken', tokenVerificationMiddleware, function (req, res) {
    User.findOne({ _id : req.user._id }).exec(function(err, user){
        if(err) return res.status(500).json({ error: err, message: "An error occurred."});

        res.json({ user: user });
    });
}); 

router.get('/admin', tokenVerificationMiddleware, function (req, res) {
    User.findOne({ _id: req.user._id }, function (err, user) {
        if (err) return res.status(500).json({ error: err });

        res.json(!!user.isAdmin);
    }); 
});

router.post('/contactus', function (req, res) {
    var newContactMessage = new ContactForm(req.body);
    newContactMessage.save(function (err, data) {
        if (err) {
            return res.status(500).json({ status: 'error', error: err, message: 'An error occurred.' });
        }

        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: '"Contact Form" <' + req.body.email + '>',
            to: 'amitrev91@abv.bg, ivan_dzholev@abv.bg, ivan@writecraft.io, asen@writecraft.io, reneta.demerdzhieva@gmail.com', // list of receivers
            subject: 'New contact form submission', // Subject line
            text:
            'From: ' + req.body.email + '\n' +
            'Submission Content:\n\n' + req.body.content, // html body
            html:
            '<b>From: <br></b>' + req.body.email + '<br><br><br>' +
            '<b>Submission Content:</b><br>' + req.body.content // html body
        };

        mailer.sendMail(mailOptions);

        return res.status(200).json({ status: 'success', message: 'Thank you for contacting us, your message was sent successfully.' });
    });
});

router.get('/contactus', tokenVerificationMiddleware, function (req, res) {
    if (req.user.username != 'asen') {
        return res.status(401).json({ status: 'error', message: 'You are not authorized to view this content.' });
    }
    ContactForm.find({}).exec(function (err, data) {
        if (err) {
            return res.status(500).json({ status: 'error', error: err, message: 'An error occurred.' });
        }
        return res.status(200).json({ status: 'success', message: 'Asen truly is awesome.', contactData: data });
    });
});

module.exports = router;