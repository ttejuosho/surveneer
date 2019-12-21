/* eslint-disable max-len */
const questionController = require('../controllers/question_controller.js');
const {check} = require('express-validator');

module.exports = (app) => {
  app.get('/newQuestion/:surveyId', questionController.getNewQuestionPage);
  app.get('/updateQuestion/:questionId', questionController.getUpdateQuestionPage);
  app.put('/updateQuestion/:questionId',
      [
        check('question').not().isEmpty().withMessage('Please enter a question'),
        check('optionType').not().isEmpty().withMessage('Please choose an option'),
      ],
      questionController.updateQuestion);
  app.get('/deleteQuestion/:questionId', questionController.deleteQuestion);
  app.post('/newQuestion/:surveyId',
      [
        check('question').not().isEmpty().withMessage('Please enter a question'),
        check('optionType').not().isEmpty().withMessage('Please choose an option'),
      ],
      questionController.newQuestion);
};
