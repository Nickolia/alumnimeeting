
var express = require('express'),
    path = require('path'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    mongoose = require('mongoose'),
    _ = require('lodash-node');

var app = module.exports = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var allowCrossDomain = function(req, res, next) {

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", true);

    next();
};
mongoose.connect('mongodb://localhost:27017/alumnimeeting', function (error) {
    if (error) {
        console.log(error);
    }
});

var init = function(){
    app.all(allowCrossDomain);
    app.use(logger('dev'));
    app.use(methodOverride());
    app.use(session({ resave: true, saveUninitialized: true,secret: 'uwotm8' }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, 'public')));

    io = require('socket.io').listen(server);

    io.on('connection', Connect);

};

app.set('port', process.env.PORT || 4300);

var Connect =  function (socket) {
    var socketId = socket.id;

};

server.listen(app.get('port'), function (err) {
    if (err) {
        throw err
    }
    console.log('Start server listening on port ' + app.get('port'));
    init()
});
