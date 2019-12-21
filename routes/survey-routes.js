/* eslint-disable max-len */
const surveyController = require('../controllers/survey_controller.js');
const {check} = require('express-validator');

module.exports = function(app) {
  app.get('/newSurvey', surveyController.getNewSurveyPage);

  app.post('/newSurvey',
      [check('surveyName').not().isEmpty().withMessage('Please enter a name for your survey')],
      surveyController.newSurvey);

  app.post('/updateSurvey', surveyController.updateSurvey);
  app.get('/deleteSurvey/:surveyId', surveyController.deleteSurvey);
  app.get('/mysurveys/:surveyId', surveyController.mySurveys);
  app.get('/viewSurvey/:surveyId', surveyController.viewSurvey);
  app.get('/surveys/:surveyId/v2', surveyController.viewSurveyV2);
  app.get('/sendSurvey/:surveyId', surveyController.getSendSurveyPage);
  app.post('/emailSurvey/:surveyId',
      [
        check('email').not().isEmpty().escape().withMessage('Please enter an email address'),
        check('subject').not().isEmpty().escape().withMessage('Please enter a subject for your email'),
        check('message').not().isEmpty().escape().withMessage('Please enter a message'),
        check('surveyId').not().isEmpty().escape().withMessage('Survey Id is missing, Please refresh this page and try again'),
      ],
      surveyController.emailSurvey);
};
