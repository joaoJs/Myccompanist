const express = require('express');
const multer = require('multer');
const ensure = require('connect-ensure-login');

const bcrypt = require('bcrypt');
const passport = require('passport');

const UserModel = require('../models/user-model.js');
const MessageModel = require('../models/message.js');

const router = express.Router();

const myUploader = multer(
  {
    dest: __dirname + '/../public/uploads/'
  }
);


router.get('/user/profile',ensure.ensureLoggedIn('/login'),(req,res,next) => {
    console.log("REQ.USER!! -------->   ", req.user);
    if (!req.user) {
        res.render('auth/login.ejs');
        return;
    }

    UserModel.findOne(
      { _id : req.user._id },
      (err, user) => {

        if (err) {
            next(err);
            return;
        }
      var count = 0;

      if (req.user.messages.length > 0) {
        console.log("1");
        req.user.messages.forEach(message => {
            if (message.read === '0') {
              console.log("HERE!! ");
              count++;
            }
        });
      }
      console.log("COUNT!! ------->  ", count);


      res.locals.unread = count;
      res.locals.user = user;
      res.render('user/profile.ejs');
      }
    );

});


router.post('/user/profile/pic_change/:unread',
            myUploader.single('prof_pic'),
            (req,res,next) => {
      UserModel.findOne(
        { _id: req.user.id},
        (err,user) => {
          console.log(user);
          if (err) {
            next(err);
            return;
          }

          if (req.file) {
              user.prof_pic = '/uploads/'+req.file.filename;
            }

            user.save((err) => {
              if (err) {
                next(err);
                return;
              }

              res.locals.user = user;
              res.locals.unread = req.params.unread;

              req.flash('updateSuccess','Profile Picture update successful.');
              res.render('user/profile.ejs');
            });
        }
      );

});

router.post('/user/delete', ensure.ensureLoggedIn('/login'),(req,res,next) => {



  UserModel.findByIdAndRemove(req.user._id, (err,todo) => {

    if (err) {
      next(err);
      return;
    }

    res.redirect('/');

  });

});

router.get("/user/:id/profile", ensure.ensureLoggedIn('/login'),(req,res,next) => {
    console.log("OTHER PROFILE!! ");
    UserModel.findById(
      req.params.id,
      (err,user) => {
        if (user.grades.length > 0) {
          const sum = user.grades.reduce((a,b) => Number(a) + Number(b));
          const average = Number((sum / user.grades.length).toFixed(1));
          console.log("SUM!! ----->   " , sum);
          console.log("AVERAGE!!------->  ", average);
          res.locals.average = average;
        }
        res.locals.user = user;
        res.render('user/other-user.ejs');
      }
    );
});

router.get('/user/:id/contact',ensure.ensureLoggedIn('/login'), (req,res,next) => {
   // here you will render the contact form
   res.locals.id = req.params.id;
   res.render('messages/contact.ejs');
});

router.post('/user/:id/send-message',ensure.ensureLoggedIn('/login'), (req,res,next) => {
    // here you will create a message with the info from the form and
    //push it to the array of the user wih this id.
    UserModel.findById(req.params.id, (err,user) => {

        const message = new MessageModel({
                    from: req.user.username,
                    to: user.username,
                    email: req.user.email,
                    subject: req.body.subject,
                    content: req.body.content,
                    read: '0'
      });

      user.messages.push( message );
        user.save((err) => {
          if(err) {
            next(err);
            return;
          }
      req.user.sentMessages.push( message );
        req.user.save((err) => {
          if (err) {
            next(err);
            return;
          }
        });

        MessageModel.create(
          message, (err,mess) => {
            if(err) {
              next(err);
              return;
            }
            console.log('new message --> ', mess);
          });

          /*if (err && user.errors) {
             res.locals.errors = user.errors;

             res.locals.user = user;

             // disply again the form with the errors
             res.render('review-views/review-form.ejs');
             return;
          }*/

          /*if (err && !product.errors) {
              // skip to the error handler middleware
              next(err);
              // return to avoid showing the view
              return;
                // early return instead of "else"
          }*/
          res.redirect('/user/' + user._id + '/profile');
        });
    });
});

router.post('/user/:userId/rate', ensure.ensureLoggedIn('/login'),(req,res,next) => {
    console.log("HERE!!!!!");
    UserModel.findById(req.params.userId, (err,user) => {
        const grade = req.body.grade;
        const hasUser = req.user.ratingHistory.includes(user.username);
        // check if current user has already rated this user
        if (!hasUser) {
          user.grades.push(grade);
          req.user.ratingHistory.push(user.username);

          user.save((err,saved) => {
            if (err) {
              next(err);
              return;
            }

          });
          req.user.save((err,savedUser) => {
              if (err) {
                next(err);
                return;
              }
              console.log("SAVED -------> ", savedUser);
          });
        } else {
          res.locals.error = "You can only rate this user once.";
        }

      res.redirect('/user/'+user._id+'/profile');

    });
});

router.get('/user/:userId/common-messages',ensure.ensureLoggedIn('/login'), (req,res,next) => {
  UserModel.findById(req.params.userId, (err, user) => {
    // filter the common messages
    const messagesFrom = req.user.messages.filter(message => message.from === user.username);
    const messagesTo = req.user.sentMessages.filter(message => message.to === user.username);
    const listOfMessages = messagesFrom.concat(messagesTo);
    // sort them in descendent order (from most recent, to least recent)
    listOfMessages.sort((a,b) => b.createdAt - a.createdAt);
    res.locals.listOfMessages = listOfMessages;
    res.locals.user = user;
    res.render('messages/common-messages.ejs');
  });
});



module.exports = router;
