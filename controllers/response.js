const express = require('express');
const app = express();
const router = express.Router();
const db = require('../models');
const appRoot = require('app-root-path');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const transporter = require('../config/email/email');

// Get all responses to a Survey
router.get('/responses/:SurveySurveyId/view', (req, res) => {
    db.Response.findAll({
        where: {
            SurveySurveyId: req.params.SurveySurveyId,
        },
        include: [
            { model: db.Question, as: "Question", attributes: [ "questionId", "question", "questionInstruction", "optionType", "option1", "option2", "option3", "option4"] },
            { model: db.Respondent, as: "Respondent", attributes: [ "respondentId", "respondentName", "respondentEmail", "respondentPhone"]},
            { model: db.Survey, as: "Survey", attributes: [ "surveyId", "surveyName", "RespondentCount", "RecipientCount", "QuestionCount" ]}
    ]
    }).then(function(responses) {
        res.json(responses);
    }).catch(function(err) {
        res.render('error', err);
    });
});

// Save Responses and Respondent (Needs Refactoring - Error handling)
router.post('/responses/:userId', (req, res) => {
    var resId = '';

    // if respondent exists in Recipients table, update their information
    db.Recipient.findOne({
        where: {
            recipientEmail: req.body.respondentEmail,
        }
    }).then((dbRecipient)=>{
        if (dbRecipient !== null){
            db.Recipient.update({ 
                recipientName: req.body.respondentName,
                recipientPhone: req.body.respondentPhone,
            }, {
                where: {
                    recipientEmail: req.body.respondentEmail,
                }
            });
        }
    });

    db.Respondent.create({
        respondentName: req.body.respondentName,
        respondentEmail: req.body.respondentEmail,
        respondentPhone: req.body.respondentPhone,
        SurveySurveyId: req.body.surveyId,
        UserUserId: req.params.userId
    }).then((dbRespondent) => {
        resId = dbRespondent.dataValues.respondentId;
        const qandaArray = [];
        for (let i = 0; i < req.body.questionLength; i++) {
            const qanda = {
                QuestionQuestionId: req.body['questionId' + i],
                answer: req.body['answer' + i],
                RespondentRespondentId: dbRespondent.dataValues.respondentId,
                SurveySurveyId: req.body.surveyId,
            };
            qandaArray.push(qanda);
        }

        for (let i = 0; i < qandaArray.length; i++) {
            // Save response to Database
            db.Response.create(qandaArray[i]);
            // Update Response Counts in DB
            if (qandaArray[i].answer.toLowerCase() === 'yes') {
                db.Question.findOne({
                    where: {
                        questionId: qandaArray[i].QuestionQuestionId,
                    },
                }).then((dbQuestion) => {
                    dbQuestion.dataValues.YesResponseCount += 1;
                    var updatedQuestion = { YesResponseCount: dbQuestion.dataValues.YesResponseCount };
                    db.Question.update(updatedQuestion, {
                        where: {
                            questionId: dbQuestion.dataValues.questionId,
                        },
                    });
                });
            } else if (qandaArray[i].answer.toLowerCase() === 'no') {
                db.Question.findOne({
                    where: {
                        questionId: qandaArray[i].QuestionQuestionId,
                    },
                }).then((dbQuestion) => {
                    dbQuestion.dataValues.NoResponseCount += 1;
                    var updatedQuestion = { NoResponseCount: dbQuestion.dataValues.NoResponseCount };
                    db.Question.update(updatedQuestion, {
                        where: {
                            questionId: dbQuestion.dataValues.questionId,
                        },
                    });
                });
            } else if (qandaArray[i].answer.toLowerCase() === 'true') {
                db.Question.findOne({
                    where: {
                        questionId: qandaArray[i].QuestionQuestionId,
                    },
                }).then((dbQuestion) => {
                    dbQuestion.dataValues.TrueResponseCount += 1;
                    var updatedQuestion = { TrueResponseCount: dbQuestion.dataValues.TrueResponseCount };
                    db.Question.update(updatedQuestion, {
                        where: {
                            questionId: dbQuestion.dataValues.questionId,
                        },
                    });
                });
            } else if (qandaArray[i].answer.toLowerCase() === 'false') {
                db.Question.findOne({
                    where: {
                        questionId: qandaArray[i].QuestionQuestionId,
                    },
                }).then((dbQuestion) => {
                    dbQuestion.dataValues.FalseResponseCount += 1;
                    var updatedQuestion = { FalseResponseCount: dbQuestion.dataValues.FalseResponseCount };
                    db.Question.update(updatedQuestion, {
                        where: {
                            questionId: dbQuestion.dataValues.questionId,
                        },
                    });
                });
            }
        }

        // Now increment Number of respondents
        db.Survey.findOne({
            where: {
                surveyId: req.body.surveyId,
            },
        }).then((dbSurvey) => {
            dbSurvey.dataValues.RespondentCount += 1;
            const updatedSurvey = {
                surveyName: dbSurvey.dataValues.surveyName,
                getId: dbSurvey.dataValues.getId,
                RespondentCount: dbSurvey.dataValues.RespondentCount,
                preSurveyInstructions: dbSurvey.dataValues.preSurveyInstructions,
                postSurveyInstructions: dbSurvey.dataValues.postSurveyInstructions,
                surveyNotes: dbSurvey.dataValues.surveyNotes,
            };
            const hbsObject = {
                respondentName: req.body.respondentName,
                respondentEmail: req.body.respondentEmail,
                respondentPhone: req.body.respondentPhone,
                surveyId: req.body.surveyId,
                qanda: qandaArray,
                surveyName: dbSurvey.dataValues.surveyName,
                // getId: dbSurvey.dataValues.getId,
                // RespondentCount: dbSurvey.dataValues.RespondentCount,
                // preSurveyInstructions: dbSurvey.dataValues.preSurveyInstructions,
                postSurveyInstructions: dbSurvey.dataValues.postSurveyInstructions,
                // surveyNotes: dbSurvey.dataValues.surveyNotes,
                layout: false,
                resId: resId,
                userId: req.params.userId,
            };

            db.Survey.update(updatedSurvey, {
                where: {
                    surveyId: dbSurvey.dataValues.surveyId,
                },
            }).then((dbSurvey) => {
                // const hbsObject = {
                //   surveyId: req.body.surveyId,
                //   respondentName: req.body.respondentName,
                //   respondentEmail: req.body.respondentEmail,
                //   respondentPhone: req.body.respondentPhone,
                //   qanda: qandaArray,
                //   layout: false,
                // };
            });
            //console.log(hbsObject);
            return res.render('survey/complete', hbsObject);
        });
    }).catch((err) => {
        res.render('error', err);
    });
});


router.get('/complete', (req, res) => {
    return res.render('survey/complete', { layout: false });
});

module.exports = router;