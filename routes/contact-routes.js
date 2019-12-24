/* eslint-disable max-len */
const contactController = require('../controllers/contact_controller.js');
const { check } = require('express-validator');
const Security = require('../config/security/security.js');
require('dotenv').config();

module.exports = (app) => {
    app.post('/subscribe', [
        check('firstName').not().isEmpty().escape().withMessage('Please enter your first name'),
        check('lastName').not().isEmpty().escape().withMessage('Please enter your last name'),
        check('email').not().isEmpty().escape().withMessage('Please enter your email address'),
    ], contactController.subscribe);
    app.get('/contacts', Security.isLoggedIn, contactController.getContacts);
    app.post('/updateContact', Security.isLoggedIn, contactController.updateContact);
    app.post('/deleteContact', Security.isLoggedIn, contactController.deleteContact);
};