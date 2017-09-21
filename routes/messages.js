const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const ensure = require('connect-ensure-login');

const MessageModel = require('../models/message.js');
const UserModel = require('../models/user-model.js');

const router = express.Router();

router.get('/messages/:id',ensure.ensureLoggedIn('/login'), (req,res,next) => {
    UserModel.findById(req.params.id, (err, user) => {
        if (err) {
          next(err);
          return;
        }
        // send array of messages to inbox.ejs so that you can display the
        // messages


        // sort messages in descendent order
        user.messages.sort((a,b) => b.createdAt - a.createdAt);

        res.locals.currUser = req.user;
        res.locals.user = user;
        res.locals.messages = user.messages;

        res.render('messages/inbox.ejs');
    });
});

router.get('/messages/:id/view-messages/:messageId', ensure.ensureLoggedIn('/login'),(req,res,next) => {
    console.log('Params ----> ', req.params.messageId);
    MessageModel.findById(req.params.messageId, (err,message) => {
      console.log("Messages!! ---->   ", message );
        if(err) {
          next(err);
          return;
        }
        // message is read now
        message.read = '1';
        req.user.messages.forEach(mess => {
          if (mess._id.toString() === message._id.toString()) {
              console.log('INSIDE');
              mess.read = '1';
          }
        });
        message.save((err, saved) => {
            if (err) {
              next(err);
              return;
            }
            console.log("SAVED ------>   ",saved);
        });
        req.user.save((err,saved) => {
          if (err) {
            next (err);
            return;
          }
        });
        UserModel.findById(req.params.id, (err, user) => {

        res.locals.currUser = req.user;
        res.locals.user = user;
        res.locals.message = message;
        res.render('messages/view-messages.ejs');
      });
    });

});

router.get('/messages/:id/reply/:messageId',ensure.ensureLoggedIn('/login'), (req,res,next) => {
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

router.post('/messages/:id/send-reply/:from',ensure.ensureLoggedIn('/login'), (req,res,next) =>{
        //console.log("SEND-REPLY");
        UserModel.findOne(
          { username: req.params.from },
          (err, userFromDb) => {
             //console.log("User From DB!! --->  " ,userFromDb.username);
              if (err) {
                next(err);
                return;
              }
              const reply = new MessageModel({
                  from: req.user.username,
                  to: userFromDb.username,
                  email: req.user.email,
                  subject: req.body.subject,
                  content: req.body.content,
                  read: '0'
              });
              userFromDb.messages.push (reply);
              userFromDb.save((err) => {
                  if (err) {
                    next(err);
                    return;
                  }
              //console.log("USER AFTER ---->   ", userFromDb);
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

router.get('/messages/:id/sent-messages',ensure.ensureLoggedIn('/login'), (req,res,next) => {
    UserModel.findById(req.params.id, (err,user) => {

        res.locals.currUser = req.user;
        user.sentMessages.sort((a,b) => b.createdAt - a.createdAt);
        res.locals.listOfMessages = user.sentMessages;
        res.render('messages/sent-messages.ejs');
    });
});

router.get('/messages/:id/sent-messages/:messageId',ensure.ensureLoggedIn('/login'), (req,res,next) => {
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

router.post("/messages/:messId/delete",ensure.ensureLoggedIn('/login'), (req,res,next) => {
    var index;
    req.user.messages.forEach((message,i) => {
        if (message._id.toString() === req.params.messId.toString()) {
          console.log('HERE!!!! MESSID');
          index = i;
        }
    });
    req.user.messages.splice(index, 1);
    req.user.save((err,savedUser) => {
        if (err) {
          next(err);
          return;
        }
    });
    res.redirect('/messages/' + req.user._id);
});

router.post("/messages/:messId/delete-sent",ensure.ensureLoggedIn('/login'), (req,res,next) => {
    var index;
    req.user.sentMessages.forEach((message,i) => {
        if (message._id.toString() === req.params.messId.toString()) {
          index = i;
        }
    });
    req.user.sentMessages.splice(index, 1);
    req.user.save((err,savedUser) => {
        if (err) {
          next(err);
          return;
        }
    });
    UserModel.find((err,allUsers) => {
      allUsers.forEach(user => {
        user.messages.forEach((m,i) => {
          let index2;
          if (m._id.toString() === req.params.messId.toString()) {
            index2 = i;
          }
          user.messages.splice(index2,1);
          user.save((err,saved) => {
              if(err) {
                next(err);
                return;
              }
          });
        });
      });
    });
    MessageModel.findByIdAndRemove(req.params.messId, (err,todo) => {
      if (err) {
        next(err);
        return;
      }
    res.redirect('/messages/'+req.user._id+'/sent-messages');
  });
});






module.exports = router;
