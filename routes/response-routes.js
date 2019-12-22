/* eslint-disable max-len */
const responseController = require('../controllers/response_controller.js');
const {check} = require('express-validator');

module.exports = function(app) {
  app.post('/responses/:userId',
      [
        check('respondentName').escape().isLength({min: 2, max: 50}).withMessage('You got names that long, really ?').custom((value) => {
          if (value.split(' ').length < 2) {
            return Promise.reject(new Error('First & Last Names are required'));
          }
          return true;
        }),
        check('respondentEmail').not().isEmpty().escape().isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
        check('respondentPhone').not().isEmpty().escape().isNumeric().withMessage('Please enter only numbers').isLength({min: 5, max: 15}).withMessage('Invalid Phone Number'),
      ],
      responseController.saveResponses);
  app.get('/complete', responseController.complete);
};
