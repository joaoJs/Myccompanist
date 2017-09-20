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


// linkedin social login
const LinkedInStrategy = require('passport-linkedin').Strategy;

passport.use(
  new LinkedInStrategy(
    {
        consumerKey: process.env.linkedIn_id,
        consumerSecret: process.env.linkedIn_secret,
        callbackURL: "http://127.0.0.1:3000/auth/linkedin/callback"
    },

    (token, tokenSecret, profile, done) => {
        console.log('Linked in user info:');
        console.log(profile);

        // check to see if it's the first time they log in
        UserModel.findOne(
          { linkedinID: profile.id },

          (err, userFromDb) => {
              if (err) {
                  done(err);
                  return;
              }

              // if the user already has an account, GREAT! log them in.
              if (userFromDb) {
                  done(null, userFromDb);
                  return;
              }

              // if they don't have an account, make one for them.
              const theUser = new UserModel({
                  linkedinID: profile.id,
                  username: profile.displayName
              });

              theUser.save((err) => {
                  if (err) {
                    console.log('errroooooorrr ********************', err);
                      done(err);
                      return;
                  }

                  // if save is successful, log them in.
                  done(null, theUser);
              });
          }
        ); // close UserModel.findOne( ...
    }
  ) // close new FbStrategy( ...
);
