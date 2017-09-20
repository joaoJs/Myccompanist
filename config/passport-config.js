const passport = require('passport');

const UserModel = require('../models/user-model.js');


// serializer/deserializer functions ----------

passport.serializeUser((userFromDb, done) => {
    done(null, userFromDb._id);
});


passport.deserializeUser((idFromBowl, done) => {
    UserModel.findById(
      idFromBowl,
      (err, userFromDb) => {
          if (err) {
              done(err);
              return;
          }
          done(null, userFromDb);
      }
    );
});


const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');


passport.use(
  new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password'
    },
    (username, password, done) => {
        // find the user in the DB with that email
        UserModel.findOne(
          { username: username },

          (err, userFromDb) => {
              if (err) {
                  done(err);
                  return;
              }

              if (userFromDb === null) {
                  done(null, false, { message: 'Wrong username.' });
                  return;
              }

              const isGoodPassword =
                  bcrypt.compareSync(password, userFromDb.password);

              if (isGoodPassword === false) {
                  done(null, false, { message: 'Wrong password.' });
                  return;
              }

              // if everything works, send passport the user document.
              done(null, userFromDb);
                //           |
                // passport takes "userFromDb" and calls "serializeUser"
          }
        );
    }
  )
);
