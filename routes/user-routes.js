/* eslint-disable max-len */
const userController = require('../controllers/user_controller.js');
const {check} = require('express-validator');

module.exports = (app) => {
  app.get('/profile', userController.getUserProfilePage);
  app.get('/forgot', userController.forgot);
  app.post('/forgot',
      [check('emailAddress').not().isEmpty().withMessage('Please enter your email address')],
      userController.sendPasswordResetEmail);
  app.get('/reset/:token', userController.getResetPasswordPage);
  app.post('/reset/:token', userController.resetPassword);
  app.get('/mycontacts', userController.getUserContacts);
};
