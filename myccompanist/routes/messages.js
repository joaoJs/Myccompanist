const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');

const MessageModel = require('../models/message.js');
const UserModel = require('../models/user-model.js');

const router = express.Router();

router.get('/messages/:id', (req,res,next) => {
    UserModel.findById(req.params.id, (err, user) => {
        if (err) {
          next(err);
          return;
        }
        // send array of messages to inbox.ejs so that you can display the
        // messages
        res.locals.currUser = req.user;
        res.locals.user = user;
        res.locals.messages = user.messages;
        res.render('messages/inbox.ejs');
    });
});

router.get('/messages/:id/view-messages/:messageId', (req,res,next) => {
    console.log('Params ----> ', req.params.messageId);
    MessageModel.findById(req.params.messageId, (err,message) => {
        if(err) {
          next(err);
          return;
        }
        console.log( 'ID ----> ', req.params.id);
        UserModel.findById(req.params.id, (err, user) => {

        res.locals.currUser = req.user;
        res.locals.user = user;
        res.locals.message = message;
        res.render('messages/view-messages.ejs');
      });
    });

});

router.get('/messages/:id/reply/:messageId', (req,res,next) => {
  UserModel.findById(req.params.id, (err, user) => {
      if (err) {
        next(err);
        return;
      }
      // send array of messages to inbox.ejs so that you can display the
      // messages
      user.messages.forEach(message => {
          if (message._id.toString() === req.params.messageId.toString()) {

              res.locals.message = message;
          }
      });
      res.locals.user = user;
      res.render('messages/reply.ejs');
  });
});

router.post('/messages/:id/send-reply/:from', (req,res,next) =>{
    // console.log("Params! _____>  ", req.params.messageId);
    // MessageModel.findById(req.params.messageId, (err, message) => {
    //     console.log("message  --->   ", message);
    //     if (err) {
    //       next(err);
    //       return;
    //     }
        UserModel.findOne(
          { username: req.params.from },
          (err, userFromDb) => {
             console.log("Here!! --->  " ,userFromDb.username);
              if (err) {
                next(err);
                return;
              }
              const reply = new MessageModel({
                  from: req.user.username,
                  to: userFromDb.username,
                  email: req.user.email,
                  subject: req.body.subject,
                  content: req.body.content
              });
              userFromDb.messages.push (reply);
              userFromDb.save((err) => {
                  if (err) {
                    next(err);
                    return;
                  }
              req.user.sentMessages.push( reply );
              req.user.save((err) => {
                  if (err) {
                    next(err);
                    return;
                  }
              });
              MessageModel.create(
                reply, (err,mess) => {
                  if(err) {
                    next(err);
                    return;
                  }
                  console.log('new message --> ', mess);
                });
                  res.redirect('/user/profile');
              });
          });
    //});
});

router.get('/messages/:id/sent-messages', (req,res,next) => {
    UserModel.findById(req.params.id, (err,user) => {

        res.locals.currUser = req.user;
        res.locals.listOfMessages = user.sentMessages;
        res.render('messages/sent-messages.ejs');
    });
});

router.get('/messages/:id/sent-messages/:messageId', (req,res,next) => {
  MessageModel.findById(req.params.messageId, (err,message) => {
      if(err) {
        next(err);
        return;
      }
      res.locals.currUser = req.user;
      res.locals.message = message;
      res.render('messages/view-sent-messages.ejs');

  });
});






module.exports = router;
