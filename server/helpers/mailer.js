var nodemailer = require('nodemailer');
var xoauth2 = require('xoauth2');
var gmailConfig = require('../config/gmail');

// login
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        xoauth2: xoauth2.createXOAuth2Generator({
            user: gmailConfig.user,
            clientId: gmailConfig.client_id,
            clientSecret: gmailConfig.client_secret,
            refreshToken: gmailConfig.refresh_token
        })
    }
});

module.exports = {
    sendMail: sendMail
};

function sendMail(mailOptions, callback) {
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.error(error);
        }

        if(typeof callback === 'function'){
            callback();
        }
    });
}