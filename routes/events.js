const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const ensure = require('connect-ensure-login');

const MessageModel = require('../models/message.js');
const UserModel = require('../models/user-model.js');
const EventsModel = require('../models/events.js');

const router = express.Router();


router.get("/events", ensure.ensureLoggedIn('/login'), (req,res,next) => {
    console.log("HERE!!!");
    EventsModel.find((err,events) => {
      if (err) {
        next(err);
        return;
      }
      res.locals.events = events;
      res.render('events/index.ejs');
  });
});

router.get("/events/create-event", ensure.ensureLoggedIn('/login'),(req,res,next) => {
    console.log("REQ.USER!! -------->   ", req.user);
    res.render('events/form.ejs');
});

router.post("/events/post-event", ensure.ensureLoggedIn('/login'),(req,res,next) => {
  const newEvent = new EventsModel({
      title: req.body.title,
      creator: req.user.username,
      content: req.body.content,
      date: req.body.date,
      time: req.body.time,
      location: req.body.location,
      requiredInstruments: req.body.instruments
  });
  UserModel.findById(req.user._id, (err, user) => {
      if (err) {
        next(err);
        return;
      }
      user.events.push(newEvent);
      console.log("events -----> ", user.events);
      user.save((err, saved) => {
        if (err) {
          next(err);
          return;
        }
        console.log("USER ---> ", saved);
      });
  });

  EventsModel.create(
    newEvent, (err,ev) => {
      if(err) {
        next(err);
        return;
      }
      console.log('new event --> ', ev);
    });
    EventsModel.find((err,allEvents) => {
        if (err) {
          next(err);
          return;
        }
        res.locals.events = allEvents;
        res.redirect('/events');
    });
});

/*router.get('/events/map', (req,res,next) => {
    res.render('events/map.html');
});*/


router.get("/events/:eventId/info", ensure.ensureLoggedIn('/login'),(req,res,next) => {
    EventsModel.findById(req.params.eventId, (err, ev) => {
        console.log("EVENT ---->" , ev);
        if (err) {
          next(err);
          return;
        }
        res.locals.event = ev;
        res.render('events/view-event.ejs');
    });
});

router.get("/events/:userId", ensure.ensureLoggedIn('/login'),(req,res,next) => {
    UserModel.findById(req.params.userId, (err, user) => {
        if (err) {
          next(err);
          return;
        }
        res.locals.user = user;
        res.render('events/view-user-events.ejs');
    });
});

router.post("/events/:evId/delete", ensure.ensureLoggedIn('/login'),(req,res,next) => {
  EventsModel.findByIdAndRemove(req.params.evId, (err,todo) => {
    if (err) {
      next(err);
      return;
    }
  res.redirect('/events');
  });
});




module.exports = router;
