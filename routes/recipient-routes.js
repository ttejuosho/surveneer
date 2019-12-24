/* eslint-disable max-len */
const recipientController = require('../controllers/recipient_controller.js');
const { check } = require('express-validator');
const Security = require('../config/security/security.js');

module.exports = (app) => {
    app.post('/newRecipient/:userId', [
            check('recipientName').not().isEmpty().escape().withMessage('Please enter a name'),
            check('recipientEmail').not().isEmpty().escape().withMessage('Please enter an email'),
            check('recipientPhone').not().isEmpty().escape().withMessage('Please enter a phone number'),
            check('surveyId').not().isEmpty().escape().withMessage('Please select a survey'),
        ],
        Security.isLoggedIn,
        recipientController.newRecipient);
    app.post('/updateRecipient/:recipientId', [
            check('recipientName').not().isEmpty().escape().withMessage('Please enter a name'),
            check('recipientEmail').not().isEmpty().escape().withMessage('Please enter an email'),
            check('recipientPhone').not().isEmpty().escape().withMessage('Please enter a phone number'),
            check('surveyId').not().isEmpty().escape().withMessage('Please select a survey'),
        ],
        Security.isLoggedIn,
        recipientController.updateRecipient);
    app.get('deleteRecipient/:recipientId', Security.isLoggedIn, recipientController.deleteRecipient);
};