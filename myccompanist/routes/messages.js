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
        res.locals.user = user;
        res.locals.messages = user.messages;
        res.render('messages/inbox.ejs');
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
                  res.redirect('/user/profile');
              });
          });
    //});
});





module.exports = router;
