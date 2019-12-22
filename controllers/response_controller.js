/* eslint-disable max-len */
const db = require('../models');
const {validationResult} = require('express-validator');
const sendEmail = require('../config/email/email.js');

// Get all responses to a Survey
// exports.getSurveyResponses = (req, res) => {
//   db.Response.findAll({
//     where: {
//       SurveySurveyId: req.params.SurveySurveyId,
//     },
//     include: [
//       {model: db.Question, as: 'Question', attributes: ['questionId', 'question', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4']},
//       {model: db.Respondent, as: 'Respondent', attributes: ['respondentId', 'respondentName', 'respondentEmail', 'respondentPhone']},
//       {model: db.Survey, as: 'Survey', attributes: ['surveyId', 'surveyName', 'RespondentCount', 'RecipientCount', 'QuestionCount']},
//     ],
//   }).then(function(responses) {
//     res.json(responses);
//   }).catch(function(err) {
//     res.render('error', err);
//   });
// };

// Save Responses and Respondent (Needs Refactoring - Error handling)
exports.saveResponses = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Get the Questions and render with Errors
    db.Survey.findOne({
      where: {
        surveyId: req.body.surveyId,
      },
      include: [{model: db.Question, as: 'Questions', attributes: ['questionId', 'question', 'required', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4']}],
    }).then(function(survey) {
      errors['layout'] = false;
      Object.assign(errors, survey.dataValues);
      return res.render('survey/view2', errors);
    }).catch(function(err) {
      return res.render('error', err);
    });
  } else {
    let resId = '';
    if (req.body.respondentEmail !== undefined) {
      // if respondent exists in Recipients table, update their information
      db.Recipient.findOne({
        where: {
          recipientEmail: req.body.respondentEmail,
        },
      }).then((dbRecipient) => {
        if (dbRecipient !== null) {
          db.Recipient.update({
            recipientName: req.body.respondentName,
            recipientPhone: req.body.respondentPhone,
          }, {
            where: {
              recipientEmail: req.body.respondentEmail,
            },
          });
        } else if (dbRecipient === null) {
          db.Recipient.create({
            recipientName: req.body.respondentName,
            recipientPhone: req.body.respondentPhone,
            recipientEmail: req.body.respondentEmail,
            UserUserId: req.params.userId,
            SurveySurveyId: req.body.surveyId,
          });
        }
      }).catch((err) => {
        res.render('error', err);
      });
    }

    // Save Respondent information to Respondent table
    db.Respondent.create({
      respondentName: req.body.respondentName,
      respondentEmail: req.body.respondentEmail,
      respondentPhone: req.body.respondentPhone,
      SurveySurveyId: req.body.surveyId,
      UserUserId: req.params.userId,
    }).then((dbRespondent) => {
      resId = dbRespondent.dataValues.respondentId;
      const qandaArray = [];
      for (let i = 0; i < req.body.questionLength; i++) {
        const qanda = {
          QuestionQuestionId: req.body['questionId' + i],
          answer: (req.body['answer' + i] == null ? '' : (req.body['answer' + i].includes('option') ? req.body['answer' + i].slice(7) : req.body['answer' + i])),
          RespondentRespondentId: dbRespondent.dataValues.respondentId,
          SurveySurveyId: req.body.surveyId,
        };
        qandaArray.push(qanda);
      }

      for (let i = 0; i < qandaArray.length; i++) {
        // Save response to Database
        db.Response.create(qandaArray[i]);
        // Update Response Counts in DB
        db.Question.findOne({
          where: {
            questionId: qandaArray[i].QuestionQuestionId,
          },
        }).then((dbQuestion) => {
          let optionType1 = '';
          if (qandaArray[i].answer.trim().length > 0) {
            if (dbQuestion.dataValues.optionType === 'MultipleChoice') {
              optionType1 = req.body['answer' + i].slice(0, 7) + 'ResponseCount';
            } else {
              optionType1 = qandaArray[i].answer + 'ResponseCount';
            }

            dbQuestion.dataValues[optionType1] += 1;
            const updatedQuestion = {};
            updatedQuestion[optionType1] = dbQuestion.dataValues[optionType1];
            db.Question.update(updatedQuestion, {
              where: {
                questionId: dbQuestion.dataValues.questionId,
              },
            });
          }
        }).catch((err) => {
          res.render('error', err);
        });
      }

      // Now increment Number of respondents
      db.Survey.findOne({
        where: {
          surveyId: req.body.surveyId,
        },
        include: [{model: db.User, as: 'User', attributes: ['name', 'emailAddress']}],
      }).then((dbSurvey) => {
        dbSurvey.dataValues.RespondentCount += 1;
        const updatedSurvey = {
          RespondentCount: dbSurvey.dataValues.RespondentCount,
        };
        const hbsObject = {
          respondentName: req.body.respondentName,
          respondentEmail: req.body.respondentEmail,
          respondentPhone: req.body.respondentPhone,
          surveyId: req.body.surveyId,
          qanda: qandaArray,
          surveyName: dbSurvey.dataValues.surveyName,
          postSurveyInstructions: dbSurvey.dataValues.postSurveyInstructions,
          layout: false,
          resId: resId,
          userId: req.params.userId,
        };

        // if notify is true Send Email
        if (dbSurvey.dataValues.notify) {
          const userEmail = dbSurvey.dataValues.User.emailAddress;
          const userName = dbSurvey.dataValues.User.name.split(' ')[0];
          const subject = 'New Response Notification';
          const emailBody = `
              <p>Hello ${userName},</p>
              <p style="color: black;">${(req.body.respondentName == undefined ? 'A Respondent' : req.body.respondentName)} has just completed your survey (${updatedSurvey.surveyName})</p>    
              <p>Please <a href="https://surveneer.herokuapp.com/signin">login</a> to view their responses.</p>
              <span style="font-size: 1rem;color: black;"><strong>SurvEnEEr Inc.</strong></span>
              `;
          sendEmail(emailBody, subject, userEmail);
        }

        db.Survey.update(updatedSurvey, {
          where: {
            surveyId: dbSurvey.dataValues.surveyId,
          },
        });
        return res.render('survey/complete', hbsObject);
      });
    }).catch((err) => {
      res.render('error', err);
    });
  }
};

exports.complete = (req, res) => {
  return res.render('survey/complete', {layout: false});
};
