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

router.get('/events/user-events', ensure.ensureLoggedIn('/login'),(req,res,next) => {
    res.locals.events = req.user.events;
    res.render('events/user-events.ejs');
});

router.get('/events/:event_id/view-my-event', ensure.ensureLoggedIn('/login'), (req,res,next) => {
    EventsModel.findById(req.params.event_id, (err,ev) => {
      if (err) {
        next(err);
        return;
      }
      res.locals.event = ev;
      res.render('events/edit-form.ejs');
    });

});

router.post('/events/:ev_Id/edit-event', ensure.ensureLoggedIn('/login'), (req,res,next) => {
  EventsModel.findById(req.params.ev_Id, (err, ev) => {
    if (err) {
      next(err);
      return;
    }

    ev.title = req.body.title;
    ev.content = req.body.content;
    ev.date = req.body.date;
    ev.time = req.body.time;
    ev.location = req.body.location;
    ev.requiredInstruments = req.body.instruments;

    ev.save((err) => {

        if (err) {

            next(err);

            return;

        }
        req.user.events.forEach(event => {
            if (event._id.toString() === ev._id.toString()) {
              event.title = req.body.title;
              event.content = req.body.content;
              event.date = req.body.date;
              event.time = req.body.time;
              event.location = req.body.location;
              event.requiredInstruments = req.body.instruments;
            }
        });
        req.user.save((err,saved) => {
          if (err) {
            next(err);
            return;
          }
        });
        res.redirect('/events/user-events');
    });
  });
});


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

router.post("/events/:evId/profile/delete", ensure.ensureLoggedIn('/login'),(req,res,next) => {
  let index;
  req.user.events.forEach((event,i) => {
      if (event._id.toString() === req.params.evId.toString()) {
        console.log("INSIDE!!!");
        index = i;
      }
  });
  req.user.events.splice(index,1);
  req.user.save((err,savedUser) => {
      if (err) {
        next(err);
        return;
      }
  });
  EventsModel.findByIdAndRemove(req.params.evId, (err,todo) => {
    if (err) {
      next(err);
      return;
    }
  res.redirect('/events/user-events');
  });
});




module.exports = router;
