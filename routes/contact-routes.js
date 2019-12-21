/* eslint-disable max-len */
const contactController = require('../controllers/contact_controller.js');
const {check} = require('express-validator');
require('dotenv').config();

module.exports = (app) => {
  app.get('/contacts', contactController.getContacts);
  app.post('/subscribe',
      [
        check('firstName').not().isEmpty().escape().withMessage('Please enter your first name'),
        check('lastName').not().isEmpty().escape().withMessage('Please enter your last name'),
        check('email').not().isEmpty().escape().withMessage('Please enter your email address'),
      ], contactController.subscribe);
  app.post('/updateContact', contactController.updateContact);
  app.post('/deleteContact', contactController.deleteContact);
};
