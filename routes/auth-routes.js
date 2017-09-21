const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const ensure = require('connect-ensure-login');

const UserModel = require('../models/user-model.js');

const router = express.Router();



router.get('/signup', (req, res, next) => {
    if (req.user) {
      res.redirect('/');
      return;
    }
    res.render('auth/signup.ejs');
});

router.post('/signup', (req, res, next) => {
  if (req.body.email === "" || req.body.password === "" ||
      req.body.username === "" || req.body.instrument === "") {
        res.locals.feedbackMessage = 'Please provide all fields.';
        res.render('auth/signup.ejs');
        return;
    }

  UserModel.findOne(
    { username: req.body.username },

    (err, userFromDb) => {
        if (err) {
            next(err);
            return;
        }

        if (userFromDb) {
            res.locals.feedbackMessage = 'Username already taken.';
            res.render('auth/signup.ejs');
            return;
        }

        const salt = bcrypt.genSaltSync(10);
        const scrambledPass = bcrypt.hashSync(req.body.password, salt);

        let theUser;

        if (req.body.username === 'Joao_Admin') {
           theUser = new UserModel({
              username: req.body.username,
              email: req.body.email,
              password: scrambledPass,
              instrument: req.body.instrument,
              prof_pic: "https://benopus111.files.wordpress.com/2012/01/schoenberg_blaues-s-p-february-1910.jpg",
              role: 'ADMIN'
          });
        } else {

           theUser = new UserModel({
              username: req.body.username,
              email: req.body.email,
              password: scrambledPass,
              instrument: req.body.instrument,
              prof_pic: "https://benopus111.files.wordpress.com/2012/01/schoenberg_blaues-s-p-february-1910.jpg"
          });

        }

        theUser.save((err) => {
            if (err) {
                next(err);
                return;
            }

            req.flash('signupSuccess', 'Sign up successful!');

            res.redirect('/login');
        });
    }
  );
});

router.get('/login', (req,res,next) => {
    if (!req.user) {
      res.locals.signupFeedback = req.flash('signupSuccess');
    }
    res.render('auth/login.ejs');
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/user/profile',
    failureRedirect: '/login',
    failureFlash: true
  })
);

router.get('/auth/linkedin', passport.authenticate('linkedin'));

router.get('/auth/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/user/profile');
  });


router.get('/logout', ensure.ensureLoggedIn('/login'), (req, res, next) => {
    req.logout();
    req.flash('logoutSuccess', 'Log out successful.');
    res.redirect('/login');
});




module.exports = router;
