'use strict';

var express = require('express'),
     mongoose = require('mongoose'),
     path = require('path'),
     cookieParser = require('cookie-parser'),
     bodyParser = require('body-parser'),
     logger = require('morgan'),
     session = require('express-session'),
     debug = require('debug')('kb:main'),
     passport = require('passport'),
     LocalStrategy = require('passport-local').Strategy;

var Account = require('./models/User');
var databaseURI = 'mongodb://localhost/kanban_db';

mongoose.connect(databaseURI, function(err) {
  if (err) {
    debug(databaseURI + ' connection error. ', err);
    throw(err);
  } else /*if(process.env.NODE_ENV === 'development')*/{
    debug(databaseURI + ' connected.');
  }
});

var auth = function(req, res, next){
  if (!req.isAuthenticated()) 
  	res.status(401);
  else
  	next();
};




var app = express();
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ 
	secret: 'alex^gdh&',
	resave: false,
    saveUninitialized: true
 }));

app.use(express.static(path.join(__dirname, 'public')));

// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Configure passport-local to use account model for authentication
//passport.use(new LocalStrategy(Account.authenticate()));
passport.use(Account.createStrategy());
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());


//==================================================================
// route to test if the user is logged in or not
app.get('/loggedin', function(req, res) {
  res.json(req.isAuthenticated() ? req.user : {id:0});
});


app.post('/login', passport.authenticate('local'), function(req, res, next) {
	debug('login:');
	debug(req.user);
    res.json({state:'OK'});
});

app.post('/logout', function(req, res){
  req.logout();
  res.json({state:'OK'});
});

app.post('/register', function(req, res, next) {
  debug('registering user');
  Account.register(new Account({ username: req.body.username }), req.body.password, function(err) {
   if (err) { 
		console.log('error while user register!', err); 
		return next(err); 
	}
    debug('user registered!');
    res.json({state:'OK'});
  });
});
//==================================================================
var apiRoot="/api";
var users = require('./routes/user')(auth);
app.use(apiRoot, users);
var projects = require('./routes/project')(auth);
app.use(apiRoot, projects);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});
module.exports = app;
