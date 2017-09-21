const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const ensure = require('connect-ensure-login');


const UserModel = require('../models/user-model.js');

const router = express.Router();



// console.log('yo');
router.get('/users', ensure.ensureLoggedIn('/login'),(req,res,next) => {
      if (!req.user) {
          res.render('auth/login.ejs');
          return;
      }

      UserModel.find({}).sort({ username: "ascending" }).exec((err, list) => {
         if (err) {
           next(err);
           return;
         }
         res.locals.listOfUsers = list;
         res.render('activities/users-list.ejs');
   });

});

router.get('/users/pianists',ensure.ensureLoggedIn('/login'), (req,res,next) => {
    if (!req.user) {
        res.render('auth/login.ejs');
        return;
    }

    UserModel.find({ instrument: 'piano'}).sort({ username: "ascending" }).exec((err, list) => {
       if (err) {
         next(err);
         return;
       }
       res.locals.listOfResults = list;
       res.render('activities/pianists.ejs');
     });

    /*UserModel.find(
      { instrument: 'piano' },
      (err, pianists) => {
          if (err) {
            next(err);
            return;
          }

        res.locals.listOfResults = pianists;
        res.render('activities/pianists.ejs');
      }
    );*/
});

router.get('/users/instrumentalists', ensure.ensureLoggedIn('/login'),(req,res,next) => {
    if (!req.user) {
        res.render('auth/login.ejs');
        return;
    }


    UserModel.find({ instrument: { $not: /piano/ } }).sort({ username: "ascending" }).exec((err, list) => {
       if (err) {
         next(err);
         return;
       }
       res.locals.listOfResults = list;
       res.render('activities/instrumentalists.ejs');
     });

});



router.get('/users/search',ensure.ensureLoggedIn('/login'), (req,res,next) => {
    if (!req.user) {
        res.render('auth/login.ejs');
        return;
    }

    res.render('activities/search.ejs');
});

router.get('/users/search-results', ensure.ensureLoggedIn('/login'),(req,res,next) => {

    if (!req.user) {
        res.render('auth/login.ejs');
        return;
    }

    const mySearchRegex = new RegExp(req.query.instrument, 'i');

    UserModel.find(
      { instrument: mySearchRegex },
      (err, searchResults) => {
        console.log("search results ----------->");
        console.log(searchResults);
          if (err) {
            next(err);
            return;
          }

        res.locals.lastSearch = req.query.instrument;
        res.locals.listOfResults = searchResults;
        res.render('activities/results.ejs');
      }
    );
});



module.exports = router;
