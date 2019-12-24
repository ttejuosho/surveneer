/* eslint-disable max-len */
const questionController = require('../controllers/question_controller.js');
const { check } = require('express-validator');
const Security = require('../config/security/security.js');

module.exports = (app) => {
    app.get('/newQuestion/:surveyId', Security.isLoggedIn, questionController.getNewQuestionPage);
    app.get('/updateQuestion/:questionId', Security.isLoggedIn, questionController.getUpdateQuestionPage);
    app.put('/updateQuestion/:questionId', [
            check('question').not().isEmpty().withMessage('Please enter a question'),
            check('optionType').not().isEmpty().withMessage('Please choose an option'),
        ],
        Security.isLoggedIn,
        questionController.updateQuestion);
    app.get('/deleteQuestion/:questionId', Security.isLoggedIn, questionController.deleteQuestion);
    app.post('/newQuestion/:surveyId', [
            check('question').not().isEmpty().withMessage('Please enter a question'),
            check('optionType').not().isEmpty().withMessage('Please choose an option'),
        ],
        Security.isLoggedIn,
        questionController.newQuestion);
};