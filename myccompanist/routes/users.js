const express = require('express');
const multer = require('multer');

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


router.get('/user/profile',(req,res,next) => {
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

      res.locals.user = user;
      res.render('user/profile.ejs');
      }
    );

});


router.post('/user/profile/pic_change',
            myUploader.single('prof_pic'),
            (req,res,next) => {
              console.log('here!!');
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

              req.flash('updateSuccess','Profile Picture update successful.');
              res.render('user/profile.ejs');
            });
        }
      );

});

router.post('/user/delete', (req,res,next) => {



  UserModel.findByIdAndRemove(req.user._id, (err,todo) => {

    if (err) {
      next(err);
      return;
    }

    res.redirect('/');

  });

});

router.get("/user/:id/profile", (req,res,next) => {
    UserModel.findById(
      req.params.id,
      (err,user) => {
        res.locals.user = user;
        res.render('user/other-user.ejs');
      }
    );
});

router.get('/user/:id/contact', (req,res,next) => {
   // here you will render the contact form
   res.locals.id = req.params.id;
   res.render('messages/contact.ejs');
});

router.post('/user/:id/send-message', (req,res,next) => {
    // here you will create a message with the info from the form and
    //push it to the array of the user wih this id.
    UserModel.findById(req.params.id, (err,user) => {

        const message = new MessageModel({
                    from: req.user.username,
                    email: req.user.email,
                    subject: req.body.subject,
                    content: req.body.content
      });

      user.messages.push( message );
        user.save((err) => {
          if(err) {
            next(err);
            return;
          }
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




module.exports = router;
