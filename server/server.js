#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var morgan = require('morgan');
var io = require('socket.io');
var path = require("path");
var cors = require('cors');
var app = express();
var port, connection_string;
initializeVariables();

mongoose.connect(connection_string, { db: { nativeParser: true } }, null, function(error){
    if(error) console.log('MongoDB connection error', error);
    else console.log('Connected to MongoDB');
});

var models = ['contact-form.js', 'rooms.js', 'messages.js', 'notifications.js', 'users.js'];

models.forEach(function (filename) { 
    require(__dirname + '/models/' + filename);
}); 

var server = app.listen(port, function () {
    var thedbstr = process.env.USE_DB ? process.env.USE_DB : 'mlab';
    if (!process.env.PRODUCTION) console.log('%s: Node server started on port %d, using %s database ...', Date(Date.now()), port, thedbstr);
});



/* Sockets */
var socket = io.listen(server);
var socketManager = require('./helpers/socket-manager');
socketManager.init(socket);
app.use(cors());
app.use(compression());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

//setup Prerendr IO for SEO
// app.use(require('prerender-node').set('prerenderToken', 'd5uHUKbJ4Q5A8AfcPxCG'));

if (!process.env.PRODUCTION) {
    app.use(morgan('dev'));
}

app.use(cookieParser());

// Routes
var api = require('./routes/api');
app.use('/api', api);

app.use('/img', express.static(path.join(__dirname, '..', 'public'), { maxAge: 86400000 }));
app.use('/fonts', express.static(path.join(__dirname, '..', 'public'), { maxAge: 172800000 }));
app.use('/', express.static(path.join(__dirname, '..', 'public')));

app.use('/*', function (req, res) {
    // Use res.sendfile, as it streams instead of reading the file into memory.
    res.sendFile('/index.html', { root: path.join(__dirname, '..', 'public/www') });
});

//ERRORS
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

function initializeVariables() { 
    port = 3001;

    connection_string = 'mongodb://admin:gotin@ds119258.mlab.com:19258/gotin';

    if(process.env.PRODUCTION == "true") {
        port = 3000;
        connection_string = 'mongodb://writecraft-admin:writecraftgeidjolev@192.168.147.30:27017/writecraft?authSource=user-data';
    }
}
  
//Custom behaviour
String.prototype.toObjectId = function () {
    var ObjectId = (mongoose.Types.ObjectId);
    return new ObjectId(this.toString());
};