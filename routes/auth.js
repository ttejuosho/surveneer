/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
const authController = require('../controllers/authcontroller.js');
const db = require('../models');
const appRoot = require('app-root-path');
// eslint-disable-next-line new-cap
require('dotenv').config();

module.exports = function(upload, app, passport) {
  app.get('/callback', (req, res, next) => {
    passport.authenticate('auth0', (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect('/signin');
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        const returnTo = req.session.returnTo;
        delete req.session.returnTo;
        req.session.globalUser = {};
        req.session.globalUser['userId'] = user.id;
        req.session.globalUser['emailAddress'] = user.displayName;
        req.session.globalUser['profileImage'] = user.picture;
        // db.User.create({
        //   emailAddress: user.displayName,
        //   profileImage: user.picture
        // }).then(function(){
        //   res.redirect(returnTo || '/profile');
        // });
        // req.session.globalUser['phoneNumber'] = user.phoneNumber;
        // req.session.globalUser['initials'] = req.session.globalUser.name.split(' ')[0][0] + req.session.globalUser.name.split(' ')[1][0];
        res.redirect(returnTo || '/surveys');
      });
    })(req, res, next);
  });

  // route for signup page
  app.get('/signup', authController.signup);

  // route for signin page
  app.get('/signin', authController.signin);

  // Post Route to Update User Info
  app.post('/userUpdate', (req, res) => {
    upload(req, res, (err) => {
      const updatedUserInfo = {
        name: req.body.name,
        emailAddress: req.body.emailAddress,
        phoneNumber: req.body.phoneNumber,
      };
      // Validate User Info
      if (req.file !== undefined && req.body.profileImageRadio == undefined) {
        updatedUserInfo['profileImageError'] = 'Profile or Survey ? Which are you uploading ? ';
        Object.assign(updatedUserInfo, req.session.globalUser);
        return res.render('user/profile', updatedUserInfo);
      } else if (req.body.name == '') {
        Object.assign(updatedUserInfo, req.session.globalUser);
        updatedUserInfo['nameError'] = 'Whats your name ?';
        return res.render('user/profile', updatedUserInfo);
      } else if (req.body.emailAddress == '') {
        Object.assign(updatedUserInfo, req.session.globalUser);
        updatedUserInfo['emailAddressError'] = 'Uhm... Im going to need your email address.';
        return res.render('user/profile', updatedUserInfo);
      } else if (req.body.phoneNumber == '') {
        Object.assign(updatedUserInfo, req.session.globalUser);
        updatedUserInfo['phoneNumberError'] = 'What if I want to call you.';
        return res.render('user/profile', updatedUserInfo);
      } else {
        if (req.file !== undefined) {
          if (req.body.profileImageRadio === 'profileimage') {
            updatedUserInfo.profileImage = req.file.filename;
          } else {
            updatedUserInfo.surveyImage = req.file.filename;
            db.Survey.update(updatedUserInfo, {
              where: { 
                UserUserid: req.session.passport.user 
              }
            })
          }
        }
        db.User.update(updatedUserInfo, {
          where: {
            userId: req.session.passport.user,
          },
        }).then((dbUser) => {
          res.redirect('/profile');
        }).catch((err) => {
          res.render('error', err);
        });
      }
    });
  });

  app.post('/signup', (req, res, next) => {
    upload(req, res, (err) => {
      if (req.file === undefined) {
        const msg = {
          error: 'Sign Up Failed: No Image Attached',
          layout: 'partials/prelogin',
        };
        return res.render('auth/signup', msg);
      } else if (req.body.name == '' || req.body.emailAddress == '' || req.body.phoneNumber == '') {
        const msg = {
          error: 'Name, Email, & Phone Number required ',
          layout: 'partials/prelogin',
        };
        return res.render('auth/signup', msg);
      } else if (err) {
        const msg = {
          error: 'Sign Up Failed',
          layout: 'partials/prelogin',
        };
        return res.render('auth/signup', msg);
      } else {
        passport.authenticate('local-signup', (err, user, info) => {
          if (err) {
            return next(err); // will generate a 500 error
          }
          if (!user) {
            const msg = {
              error: 'Sign Up Failed: Username already exists',
              layout: 'partials/prelogin',
            };
            return res.render('auth/signup', msg);
          }
          req.login(user, (signupErr) => {
            if (signupErr) {
              const msg = {
                error: 'Sign up Failed',
                layout: 'partials/prelogin',
              };
              return res.render('auth/signup', msg);
            }

            req.session.globalUser = {};
            req.session.globalUser['userId'] = user.userId;
            req.session.globalUser['name'] = user.name;
            req.session.globalUser['emailAddress'] = user.emailAddress;
            req.session.globalUser['phoneNumber'] = user.phoneNumber;
            req.session.globalUser['profileImage'] = `${appRoot}/` + user.profileImage;
            req.session.globalUser['initials'] = req.session.globalUser.name.split(' ')[0][0] + req.session.globalUser.name.split(' ')[1][0];
            res.redirect('/surveys');
          });
        })(req, res, next);
      }
    });
  });

  app.post('/signin', function(req, res, next) {
    passport.authenticate('local-signin', function(err, user, info) {
      if (err) {
        return next(err); // will generate a 500 error
      }
      // User is boolean
      if (!user) {
        const msg = {
          error: 'Your Username or Password was incorrect',
          layout: 'partials/prelogin',
        };
        return res.render('auth/signin', msg);
      }

      req.login(user, (loginErr) => {
        if (loginErr) {
          const msg = {
            error: 'Authentication Failed',
            layout: 'partials/prelogin',
          };
          return res.render('auth/signin', msg);
        }

        req.session.globalUser = {};
        req.session.globalUser['userId'] = user.userId;
        req.session.globalUser['name'] = user.name;
        req.session.globalUser['emailAddress'] = user.emailAddress;
        req.session.globalUser['phoneNumber'] = user.phoneNumber;
        req.session.globalUser['profileImage'] = user.profileImage;
        req.session.globalUser['initials'] = req.session.globalUser.name.split(' ')[0][0] + req.session.globalUser.name.split(' ')[1][0];
        return res.redirect('/surveys');
      });
    })(req, res, next);
  });

  // route for user dashboard
  app.get('/surveys', isLoggedIn, authController.surveys);

  // route for new Survey Page
  app.get('/newSurvey', isLoggedIn);
  app.get('/profile', isLoggedIn);
  app.get('/index', isLoggedIn);
  app.get('/newQuestion', isLoggedIn);
  app.get('/contacts', isLoggedIn);

  // route for logging out
  app.get('/logout', authController.logout);

  // ======================WHERE THE MAGIC HAPPENS============================/
  // this is the route that prints out the user information from the user table
  app.get('/sessionUserId', authController.sessionUserId);

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/signin');
  }
};
