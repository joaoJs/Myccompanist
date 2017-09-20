const express      = require('express');
const path         = require('path');
const favicon      = require('serve-favicon');
const logger       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const layouts      = require('express-ejs-layouts');
const mongoose     = require('mongoose');
const session      = require('express-session');
const passport     = require('passport');
const flash        = require('connect-flash');

require('dotenv').config();

require('./config/passport-config.js');

mongoose.connect(process.env.MONGODB_URI);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(layouts);
app.use(session(
  {
    secret: 'this string needs to be different for every app',
    resave: true,
    saveUninitialized: true
  }
));
// passport middlewares must come AFTER session middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());



app.use((req, res, next) => {
    if (req.user) {
        res.locals.currentUser = req.user;
    }
    else {
        res.locals.currentUser = null;
    }
    next();
});


// routes go here -------------

// home route
const index = require('./routes/index');
app.use('/', index);

//auth routes
const authRoutes = require('./routes/auth-routes.js');
app.use(authRoutes);

//users activities route
const activityRoutes = require('./routes/user-activity.js');
app.use(activityRoutes);

const userRoutes = require('./routes/users.js');
app.use(userRoutes);

const messagesRoutes = require('./routes/messages.js');
app.use(messagesRoutes);

const eventsRoutes = require('./routes/events.js');
app.use(eventsRoutes);




// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
