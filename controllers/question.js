const express = require('express');
const app = express();
const router = express.Router();
const db = require('../models');
const appRoot = require('app-root-path');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const transporter = require('../config/email/email');


// Add Question to Survey Get Route
router.get('/newQuestion/:surveyId', (req, res) => {
    const hbsObject = {
        surveyId: req.params.surveyId,
        SurveySurveyId: req.params.surveyId,
        userId: req.session.passport.user,
    };
    Object.assign(hbsObject, req.session.globalUser);
    return res.render('question/new', hbsObject);
});

// Get Route to Update Question
router.get('/updateQuestion/:questionId', (req, res) => {
    db.Question
        .findByPk(req.params.questionId)
        .then((dbQuestion) => {
            const hbsObject = dbQuestion.dataValues;
            Object.assign(hbsObject, req.session.globalUser);
            res.render('question/update', hbsObject);
        });
});

// Edit Route for Questions
router.put('/updateQuestion/:questionId', (req, res) => {
    if (req.body.question == '') {
        const hbsObject = {
            questionError: 'Please enter a question.',
            SurveySurveyId: req.body.SurveyId,
        };
        Object.assign(hbsObject, req.session.globalUser);
        return res.render('question/new', hbsObject);
    }
    const dbQuestion = {
        question: req.body.question,
        optionType: req.body.optionType,
        questionInstruction: (req.body.questionInstruction == undefined ? null : req.body.questionInstruction),
        option1: (req.body.option1 == undefined ? null : req.body.option1),
        option2: (req.body.option2 == undefined ? null : req.body.option2),
        option3: (req.body.option3 == undefined ? null : req.body.option3),
        option4: (req.body.option4 == undefined ? null : req.body.option4),
        SurveySurveyId: req.body.SurveyId,
    };
    // console.log(dbQuestion);
    db.Question.update(dbQuestion, {
        where: {
            questionId: req.params.questionId,
        },
    }).then((dbQuestion) => {
        // dbQuestion is returned which is ID of updated survey
        req.session.globalUser.questionUpdateAlertMessage = true;
        res.redirect('/mysurveys/' + req.body.SurveyId);
    }).catch((err) => {
        res.render('error', err);
    });
});

// Delete Route for Questions
router.get('/deleteQuestion/:questionId', (req, res) => {
    db.Question.findByPk(req.params.questionId)
        .then((dbQuestion) => {
            // console.log(dbQuestion);
            if (dbQuestion == null) {
                const err = {
                    error: 'Question doesnt exist in db',
                };
            }
            const SurveyId = dbQuestion.SurveySurveyId;
            db.Question.destroy({
                where: {
                    questionId: dbQuestion.questionId,
                },
            }).catch((err) => {
                res.render('error', err);
            });
            // Update Number of Questions in the database
            db.Survey.findOne({
                where: {
                    surveyId: SurveyId,
                },
            }).then((dbSurvey) => {
                dbSurvey.dataValues.numberOfQuestions -= 1;
                const updatedSurvey = {
                    numberOfQuestions: dbSurvey.dataValues.numberOfQuestions,
                };

                db.Survey.update(updatedSurvey, {
                    where: {
                        surveyId: dbSurvey.dataValues.surveyId,
                    },
                }).then(() => {
                    req.session.globalUser.deleteAlertMessage = true;
                    res.redirect('/mysurveys/' + SurveyId);
                });
            }).catch((err) => {
                res.render('error', err);
            });
        });
});

router.post('/newQuestion/:surveyId', 
[
    check('question').not().isEmpty().withMessage('Please enter a question'),
    check('optionType').not().isEmpty().withMessage('Please choose an option'),
], (req, res) => {
    // TODO: Validate Received SurveyId HERE
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors['SurveySurveyId'] = req.params.surveyId;
        Object.assign(errors, req.session.globalUser);
        return res.render('question/new', errors);
    } else {
        db.Question.create({
            question: req.body.question,
            optionType: req.body.optionType,
            questionInstruction: req.body.questionInstruction,
            SurveySurveyId: req.params.surveyId,
            option1: (req.body.option1 == undefined ? null : req.body.option1),
            option2: (req.body.option2 == undefined ? null : req.body.option2),
            option3: (req.body.option3 == undefined ? null : req.body.option3),
            option4: (req.body.option4 == undefined ? null : req.body.option4),
        }).then((dbQuestion) => {
            // After successfully saving new question, Update number of Questions on the survey
            db.Survey.findOne({
                where: {
                    surveyId: req.params.surveyId,
                },
            }).then((dbSurvey) => {
                dbSurvey.dataValues.numberOfQuestions += 1;
                const updatedSurvey = {
                    surveyName: dbSurvey.dataValues.surveyName,
                    getId: dbSurvey.dataValues.getId,
                    numberOfRespondents: dbSurvey.dataValues.numberOfRespondents,
                    numberOfQuestions: dbSurvey.dataValues.numberOfQuestions,
                    preSurveyInstructions: dbSurvey.dataValues.preSurveyInstructions,
                    postSurveyInstructions: dbSurvey.dataValues.postSurveyInstructions,
                    surveyNotes: dbSurvey.dataValues.surveyNotes,
                };
                db.Survey.update(updatedSurvey, {
                    where: {
                        surveyId: dbSurvey.dataValues.surveyId,
                    },
                }).then((dbSurvey) => {
                    const hbsObject = {
                        SurveySurveyId: dbQuestion.dataValues.SurveySurveyId,
                        userId: req.session.passport.user,
                        questionAlertMessage: true,
                    };
                    Object.assign(hbsObject, req.session.globalUser);
                    if (req.body.action === 'Finish') {
                        return res.redirect('/mysurveys/' + req.params.surveyId);
                    }
                    // req.flash('success_msg','Survey created, Please add a question to your survey');
                    delete req.session.globalUser.surveyAlertMessage;
                    return res.render('question/new', hbsObject);
                });
            });
        }).catch((err) => {
            res.render('error', err);
        });
    }
});

module.exports = router;