/* eslint-disable max-len */
const surveyController = require('../controllers/survey_controller.js');
const {check} = require('express-validator');
const Security = require('../config/security/security.js');

module.exports = function(app) {
  app.get('/newSurvey', Security.isLoggedIn, surveyController.getNewSurveyPage);
  app.post('/newSurvey', [check('surveyName').not().isEmpty().withMessage('Please enter a name for your survey')],
      Security.isLoggedIn,
      surveyController.newSurvey);
  app.get('/surveys', Security.isLoggedIn, surveyController.getUserSurveys);
  app.post('/updateSurvey', Security.isLoggedIn, surveyController.updateSurvey);
  app.get('/deleteSurvey/:surveyId', Security.isLoggedIn, surveyController.deleteSurvey);
  app.get('/mysurveys/:surveyId', Security.isLoggedIn, surveyController.getSurveyPanel);
  app.get('/viewSurvey/:surveyId', Security.isLoggedIn, surveyController.viewSurvey);
  app.get('/surveys/:surveyId/v2', Security.isLoggedIn, surveyController.viewSurveyV2);
  app.get('/sendSurvey/:surveyId', Security.isLoggedIn, surveyController.getSendSurveyPage);
  app.post('/shareSurvey/:surveyId',
      [check('username').not().isEmpty().escape().withMessage('Please enter a valid email address')],
      Security.isLoggedIn, surveyController.shareSurvey);
  app.post('/emailSurvey/:surveyId', [
    check('email').not().isEmpty().escape().withMessage('Please enter an email address'),
    check('subject').not().isEmpty().escape().withMessage('Please enter a subject for your email'),
    check('message').not().isEmpty().escape().withMessage('Please enter a message'),
    check('surveyId').not().isEmpty().escape().withMessage('Survey Id is missing, Please refresh this page and try again'),
  ],
  Security.isLoggedIn,
  surveyController.emailSurvey);
};
