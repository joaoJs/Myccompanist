const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');

const UserModel = require('../models/user-model.js');

const router = express.Router();



// console.log('yo');
router.get('/users',(req,res,next) => {
      if (!req.user) {
          res.render('auth/login.ejs');
          return;
      }

     UserModel.find((err, allUsers) => {

         if (err) {
             next(err);
             return;
         }
         res.locals.listOfUsers = allUsers;

         res.render('activities/users-list.ejs');
     });
});

router.get('/users/pianists', (req,res,next) => {
    if (!req.user) {
        res.render('auth/login.ejs');
        return;
    }

    UserModel.find(
      { instrument: 'piano' },
      (err, pianists) => {
          if (err) {
            next(err);
            return;
          }

        res.locals.listOfResults = pianists;
        res.render('activities/pianists.ejs');
      }
    );
});

router.get('/users/instrumentalists', (req,res,next) => {
    if (!req.user) {
        res.render('auth/login.ejs');
        return;
    }

    UserModel.find(
      { instrument: { $not: /piano/ } },
      (err, instrumentalists) => {
          if (err) {
            next(err);
            return;
          }

        res.locals.listOfResults = instrumentalists;
        res.render('activities/instrumentalists.ejs');
      }
    );
});



router.get('/users/search', (req,res,next) => {
    if (!req.user) {
        res.render('auth/login.ejs');
        return;
    }

    res.render('activities/search.ejs');
});

router.get('/users/search-results', (req,res,next) => {

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
