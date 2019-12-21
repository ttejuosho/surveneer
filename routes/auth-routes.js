/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
const authController = require('../controllers/auth_controller.js');
const passport = require('passport');

// eslint-disable-next-line new-cap
require('dotenv').config();

module.exports = function(app) {
  app.get('/callback', authController.callback);

  app.get('/login', passport.authenticate('auth0', {
    scope: 'openid email profile',
  }), authController.login);

  // route for signup page
  app.get('/signup', authController.getSignupPage);

  // route for signin page
  app.get('/signin', authController.getSigninPage);

  // route for complete registration page
  app.get('/welcome', authController.welcome);

  app.post('/completeRegistration', authController.completeRegistration);

  // Post Route to Update User Info
  app.post('/userUpdate', authController.updateUser);

  app.post('/signup', authController.signup);

  app.post('/signin', authController.signin);

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
