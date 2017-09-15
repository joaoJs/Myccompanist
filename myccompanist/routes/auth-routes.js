const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');

const UserModel = require('../models/user-model.js');

const router = express.Router();



router.get('/signup', (req, res, next) => {
    res.render('auth/signup.ejs');
});

router.post('/signup', (req, res, next) => {
  UserModel.findOne(
    { email: req.body.email },

    (err, userFromDb) => {
        if (err) {
            next(err);
            return;
        }

        if (userFromDb) {
            res.locals.feedbackMessage = 'Email already taken.';
            res.render('auth/signup.ejs');
            return;
        }

        const salt = bcrypt.genSaltSync(10);
        const scrambledPass = bcrypt.hashSync(req.body.password, salt);

        const theUser = new UserModel({
            username: req.body.username,
            email: req.body.email,
            password: scrambledPass,
            instrument: req.body.instrument
        });

        theUser.save((err) => {
            if (err) {
                next(err);
                return;
            }

            req.flash('signupSuccess', 'Sign up successful!');

            res.redirect('/');
        });
    }
  );
});


module.exports = router;
