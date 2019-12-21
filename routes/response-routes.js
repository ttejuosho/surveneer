const responseController = require('../controllers/response_controller.js');
const {check} = require('express-validator');

module.exports = function(app) {
  app.post('/responses/:userId', responseController.saveResponses);
  app.get('/responses/:surveyId/view', responseController.getSurveyResponses);
  app.get('/complete', responseController.complete);
};
