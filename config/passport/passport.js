/* eslint-disable max-len */
// const session = require('express-session');
// load bcrypt
const bCrypt = require('bcrypt-nodejs');

module.exports = function(passport, user) {
  const User = user;
  const LocalStrategy = require('passport-local').Strategy;

  // creates a cookie for the user sessions
  passport.serializeUser(function(user, done) {
    done(null, user.userId);
  });

  // used to deserialize the user
  // reads the cookie
  passport.deserializeUser(function(userId, done) {
    User.findByPk(userId).then(function(user) {
      if (user) {
        done(null, user.get());
      } else {
        done(user.errors, null);
      }
    });
  });

  passport.use('local-signup', new LocalStrategy({
    usernameField: 'emailAddress',
    passwordField: 'password',
    passReqToCallback: true, // allows us to pass back the entire request to the callback
  },

  function(req, email, password, done) {
    const generateHash = function(password) {
      return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
    };

    User.findOne({
      where: {
        emailAddress: email,
      },
    }).then(function(user) {
      if (user) {
        return done(null, false, {
          message: 'That email is already taken',
        });
      } else {
        const userPassword = generateHash(password);
        const data = {
          emailAddress: email,
          password: userPassword,
          name: req.body.name,
          phoneNumber: req.body.phoneNumber,
          profileImage: req.file.filename,
        };

        User.create(data).then(function(newUser, created) {
          if (!newUser) {
            return done(null, false);
          }

          if (newUser) {
            return done(null, newUser);
          }
        });
      }
    });
  }
  ));

  // LOCAL SIGNIN
  passport.use('local-signin', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'emailAddress',
    passwordField: 'password',
    passReqToCallback: true, // allows us to pass back the entire request to the callback
    failureFlash: true,
  },

  function(req, email, password, done) {
    const User = user;
    const isValidPassword = function(userpass, password) {
      return bCrypt.compareSync(password, userpass);
    };

    User.findOne({
      where: {
        emailAddress: email,
      },
    }).then(function(user) {
      if (!user) {
        return done(null, false, {
          message: 'Email does not exist',
        });
      }

      if (!isValidPassword(user.password, password)) {
        return done(null, false, {
          message: 'Incorrect password.',
        });
      }
      const userinfo = user.get();
      return done(null, userinfo);
    }).catch(function(err) {
      console.log('Error:', err);
      return done(null, false, {
        message: 'Something went wrong with your Signin',
      });
    });
  }
  ));
};
