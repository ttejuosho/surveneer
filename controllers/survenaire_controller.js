/* eslint-disable no-var */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
const express = require('express');
const bCrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
// const app = express();
// eslint-disable-next-line new-cap
const router = express.Router();
const db = require('../models');
// const appRoot = require('app-root-path');
const passport = require('passport');
// const io = require('socket.io');
const { check, validationResult } = require('express-validator');
// const nodemailer = require('nodemailer');
const sendEmail = require('../config/email/email');
// const eht = require('nodemailer-express-handlebars');

router.get('/login', passport.authenticate('auth0', {
    scope: 'openid email profile',
}), (req, res) => {
    res.redirect('/index');
});

router.get('/', (req, res) => {
    res.redirect('/index');
});

router.get('/survey/v/:surveyId', (req, res) => {
    db.Response.findAll({
        where: {
            SurveySurveyId: req.params.surveyId,
        },
        include: [
            { model: db.Question, as: 'Question', attributes: ['questionId', 'question', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4'] },
            { model: db.Respondent, as: 'Respondent', attributes: ['respondentId', 'respondentName', 'respondentEmail', 'respondentPhone'] },
            { model: db.Survey, as: 'Survey', attributes: ['surveyId', 'surveyName', 'respondentCount', 'recipientCount', 'questionCount'] },
        ],
    }).then(function(responses) {
        const hbsObject = { responses: responses };
        Object.assign(hbsObject, req.session.globalUser);
        return res.render('response/view', hbsObject);
    }).catch(function(err) {
        res.render('error', err);
    });
});

router.get('/index', (req, res) => {
    return res.render('index', req.session.globalUser);
});

// Not in use at the moment
router.get('/analytics', (req, res) => {
    const hbsObject = {};
    Object.assign(hbsObject, req.session.globalUser);
    return res.render('survey/analytics', hbsObject);
});
// ============================================

router.get('/newSurvey', (req, res) => {
    const hbsObject = {};
    Object.assign(hbsObject, req.session.globalUser);
    return res.render('survey/new', hbsObject);
});

// List of Users Recipients
router.get('/mycontacts', (req, res) => {
    const hbsObject = { loadJs: 'true' };
    Object.assign(hbsObject, req.session.globalUser);
    return res.render('user/contacts', hbsObject);
});

// Forgot password page
router.get('/forgot', (req, res) => {
    const hbsObject = { layout: 'partials/prelogin' };
    return res.render('auth/forgot', hbsObject);
});

router.get('/reset/:token', (req, res) => {
    db.User.findOne({
        where: {
            resetPasswordToken: req.params.token,
        },
    }).then((dbUser) => {
        if (dbUser === null) {
            const errors = { errorMessage: 'Email not found', layout: 'partials/prelogin' };
            return res.render('auth/forgot', errors);
        }
        if ((dbUser.dataValues.resetPasswordExpires > Date.now()) && crypto.timingSafeEqual(Buffer.from(dbUser.dataValues.resetPasswordToken), Buffer.from(req.params.token))) {
            const hbsObject = { token: req.params.token, layout: 'partials/prelogin' };
            return res.render('auth/reset', hbsObject);
        } else {
            const hbsObject = { errorMessage: 'Your Password reset link has expired, please  request another one.', layout: 'partials/prelogin' };
            return res.render('auth/forgot', hbsObject);
        }
    });
});

router.post('/reset/:token', [
    check('newPassword').not().isEmpty().escape().withMessage('Please enter your new password'),
    check('confirmPassword').not().isEmpty().escape().custom((value, { req }) => (value === req.body.newPassword)).withMessage('Passwords dont match'),
], (req, res) => {
    db.User.findOne({
        where: {
            resetPasswordToken: req.params.token,
        },
    }).then((dbUser) => {
        if (dbUser === null) {
            const errors = { errorMessage: 'Email not found', layout: 'partials/prelogin' };
            return res.render('auth/forgot', errors);
        }
        if ((dbUser.dataValues.resetPasswordExpires > Date.now()) && crypto.timingSafeEqual(Buffer.from(dbUser.dataValues.resetPasswordToken), Buffer.from(req.params.token))) {
            const userPassword = bCrypt.hashSync(req.body.newPassword, bCrypt.genSaltSync(8), null);
            db.User.update({ resetPasswordExpires: null, resetPasswordToken: null, password: userPassword }, {
                where: {
                    userId: dbUser.dataValues.userId,
                },
            });
            const userName = dbUser.dataValues.name.split(' ')[0];
            const subject = 'Your SurvEnEEr Password has changed';
            const emailBody = `
            <p>Hello ${userName},</p>
            <p style="color: black;">Your password has been successfully reset.</p>    
            <p>Click <a href="https://surveneer.herokuapp.com/signin">here to Log In</a>.</p>
            <span style="font-size: 1rem;color: black;"><strong>SurvEnEEr Inc.</strong></span>`;
            return new Promise((resolve, reject) => {
                sendEmail(emailBody, subject, dbUser.dataValues.emailAddress);
                return res.redirect('/signin');
            });
        }
    });
});

router.post('/forgot', [check('emailAddress').escape().isEmail().normalizeEmail().withMessage('Please enter a valid email address')], (req, res) => {
    const token = crypto.randomBytes(20).toString('hex');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.layout = 'partials/prelogin';
        return res.render('auth/forgot', errors);
    }
    db.User.findOne({
        where: {
            emailAddress: req.body.emailAddress,
        },
    }).then((dbUser) => {
        if (dbUser === null) {
            const errors = { errorMessage: 'Email not found', layout: 'partials/prelogin' };
            return res.render('auth/forgot', errors);
        }
        const userInfo = {
            userName: dbUser.dataValues.name.split(' ')[0],
            emailAddress: dbUser.dataValues.emailAddress,
            resetPasswordToken: token,
            resetPasswordExpires: Date.now() + 3600000,
        };

        const subject = 'Reset Your SurvEnEEr Password';
        const emailBody = `
        <p>Hello ${userInfo.userName},</p>
        <p style="color: black;">Ready to reset your password ?.</p>    
        <p>Click <a href="https://surveneer.herokuapp.com/reset/${token}">Reset now</a> to begin.</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <span style="font-size: 1rem;color: black;"><strong>SurvEnEEr Inc.</strong></span>
        `;

        return new Promise((resolve, reject) => {
            sendEmail(emailBody, subject, userInfo.emailAddress);
            db.User.update({ resetPasswordExpires: userInfo.resetPasswordExpires, resetPasswordToken: userInfo.resetPasswordToken }, {
                where: {
                    userId: dbUser.dataValues.userId,
                },
            });
            const message = { emailSent: true, errorMessage: 'Password reset email has been sent to ' + userInfo.emailAddress, layout: 'partials/prelogin' };
            return res.render('auth/forgot', message);
        });
    });
});

// List of Users on SurvEnEEr
router.get('/contacts', (req, res) => {
    const hbsObject = { loadJs: 'true' };
    Object.assign(hbsObject, req.session.globalUser);
    return res.render('admin/contacts', hbsObject);
});

// New Survey POST Route, (Gets User ID from Session)
router.post('/newSurvey', [check('surveyName').not().isEmpty().escape().withMessage('Please enter a name for your survey')], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        Object.assign(errors, req.session.globalUser);
        return res.render('survey/new', errors);
    } else {
        // Check for duplicate Survey Name
        db.Survey.findOne({
            where: {
                surveyName: req.body.surveyName,
            },
        }).then((dbSurvey) => {
            if (dbSurvey == null) {
                db.Survey.create({
                    surveyName: req.body.surveyName,
                    getId: req.body.getId,
                    showTOU: req.body.showTOU,
                    surveyBrandname: req.body.surveyBrandname,
                    surveyNotes: req.body.surveyNotes,
                    surveyTOU: req.body.surveyTOU,
                    notify: req.body.notify,
                    preSurveyInstructions: req.body.preSurveyInstructions,
                    postSurveyInstructions: req.body.postSurveyInstructions,
                    respondentCount: 0,
                    UserUserId: req.session.passport.user,
                }).then((dbSurvey) => {
                    // increase number of surveys for user
                    db.User.findByPk(req.session.passport.user).then((dbUser) => {
                        dbUser.dataValues.surveyCount += 1;
                        db.User.update({ surveyCount: dbUser.dataValues.surveyCount }, {
                            where: {
                                userId: req.session.passport.user,
                            },
                        });
                    });
                    // set the Id in the returned object as SurveyId (Object Destructuring)
                    const {
                        // eslint-disable-next-line no-unused-vars
                        id,
                        ...hbsObject
                    } = dbSurvey.dataValues;

                    hbsObject.SurveySurveyId = dbSurvey.dataValues.surveyId;
                    hbsObject.surveyAlertMessage = true;
                    Object.assign(hbsObject, req.session.globalUser);
                    // When any connected client emit this event, we will receive it here.
                    return res.render('question/new', hbsObject);
                }).catch((err) => {
                    res.render('error', err);
                });
            } else {
                const err = {
                    error: dbSurvey.surveyName.toLowerCase() + ' already exists, please choose another name for your survey.',
                };
                Object.assign(err, req.session.globalUser);
                res.render('survey/new', err);
            }
        });
    }
});

// Post Route to update Survey Information
router.post('/updateSurvey', (req, res) => {
    const updatedSurveyInfo = {
        surveyName: req.body.surveyName,
        getId: req.body.getId,
        notify: req.body.notify,
        showTOU: req.body.showTOU,
        surveyBrandname: req.body.surveyBrandname,
        surveyNotes: req.body.surveyNotes,
        surveyTOU: req.body.surveyTOU,
        preSurveyInstructions: req.body.preSurveyInstructions,
        postSurveyInstructions: req.body.postSurveyInstructions,
    };

    db.Survey.update(updatedSurveyInfo, {
        where: {
            surveyId: req.body.surveyId,
        },
    }).catch((err) => {
        res.render('error', err);
    });
});

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
        required: req.body.required,
        questionInstruction: (req.body.questionInstruction == undefined ? null : req.body.questionInstruction),
        option1: (req.body.option1 == undefined ? null : req.body.option1),
        option2: (req.body.option2 == undefined ? null : req.body.option2),
        option3: (req.body.option3 == undefined ? null : req.body.option3),
        option4: (req.body.option4 == undefined ? null : req.body.option4),
        SurveySurveyId: req.body.SurveyId,
    };

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
                dbSurvey.dataValues.questionCount -= 1;
                const updatedSurvey = {
                    questionCount: dbSurvey.dataValues.questionCount,
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

// Improvise Adapt & Overcome
// Delete Route for Survey
router.get('/deleteSurvey/:surveyId', (req, res) => {
    db.Question.destroy({
        where: {
            SurveySurveyId: req.params.surveyId,
        },
    }).then(() => {
        db.Survey.findByPk(req.params.surveyId)
            .then((dbSurvey) => {
                db.Survey.destroy({
                    where: {
                        surveyId: dbSurvey.dataValues.surveyId,
                    },
                }).then(() => {
                    res.redirect('/surveys');
                });
            });
    }).catch((err) => {
        res.render('error', err);
    });
});

router.post('/newQuestion/:surveyId', [
    check('question').not().isEmpty().escape().withMessage('Please enter a question'),
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
            required: req.body.required,
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
                dbSurvey.dataValues.questionCount += 1;
                const updatedSurvey = {
                    surveyName: dbSurvey.dataValues.surveyName,
                    getId: dbSurvey.dataValues.getId,
                    respondentCount: dbSurvey.dataValues.respondentCount,
                    questionCount: dbSurvey.dataValues.questionCount,
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
                    delete req.session.globalUser.surveyAlertMessage;
                    return res.render('question/new', hbsObject);
                });
            });
        }).catch((err) => {
            res.render('error', err);
        });
    }
});

// =================Get One User Survey With Questions & Responses (Survey Panel)==========
router.get('/mysurveys/:surveyId', function(req, res) {
    db.Survey.findOne({
        where: {
            surveyId: req.params.surveyId,
        },
        include: [
            { model: db.Response, as: 'Responses', attributes: ['QuestionQuestionId', 'RespondentRespondentId', 'answer'] },
            { model: db.Respondent, as: 'Respondents', attributes: ['respondentId', 'respondentName', 'respondentEmail', 'respondentPhone'] },
            { model: db.Question, as: 'Questions' },
        ],
    }).then(function(survey) {
        const hbsObject = survey.dataValues;
        Object.assign(hbsObject, req.session.globalUser);
        res.render('survey/survey', hbsObject);
        delete req.session.globalUser.deleteAlertMessage;
        delete req.session.globalUser.questionUpdateAlertMessage;
    }).catch(function(err) {
        res.render('error', err);
    });
});

// View Route For a Survey (Internal)
router.get('/viewSurvey/:surveyId', (req, res) => {
    db.Survey.findOne({
        where: {
            surveyId: req.params.surveyId,
        },
        include: [{ model: db.Question, as: 'Questions', attributes: ['questionId', 'question', 'required', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4'] }],
    }).then(function(survey) {
        const hbsObject = survey.dataValues;
        Object.assign(hbsObject, req.session.globalUser);
        res.render('survey/view', hbsObject);
    }).catch(function(err) {
        res.render('error', err);
    });
});

// View Route For a Survey (Public) Without Layout
router.get('/surveys/:surveyId/v2', (req, res) => {
    db.Survey.findOne({
        where: {
            surveyId: req.params.surveyId,
        },
        include: [{ model: db.Question, as: 'Questions', attributes: ['questionId', 'question', 'required', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4'] }],
    }).then(function(survey) {
        survey.dataValues['layout'] = false;
        res.render('survey/view2', survey.dataValues);
    }).catch(function(err) {
        res.render('error', err);
    });
});

// Save Responses and Respondent (Needs Refactoring - Error handling for responses)
router.post('/responses/:userId', [
    check('respondentName').escape().isLength({ min: 2, max: 50 }).withMessage('You got names that long, really ?').custom((value) => {
        if (value.split(' ').length < 2) {
            return Promise.reject(new Error('First & Last Names are required'));
        }
        return true;
    }),
    check('respondentEmail').not().isEmpty().escape().isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
    check('respondentPhone').not().isEmpty().escape().isNumeric().withMessage('Please enter only numbers').isLength({ min: 5, max: 15 }).withMessage('Invalid Phone Number'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Get the Questions and render with Errors
        db.Survey.findOne({
            where: {
                surveyId: req.body.surveyId,
            },
            include: [{ model: db.Question, as: 'Questions', attributes: ['questionId', 'question', 'required', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4'] }],
        }).then(function(survey) {
            errors['layout'] = false;
            Object.assign(errors, survey.dataValues);
            return res.render('survey/view2', errors);
        }).catch(function(err) {
            return res.render('error', err);
        });
    } else {
        var resId = '';
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
                    var optionType1 = '';
                    if (qandaArray[i].answer.trim().length > 0) {
                        if (dbQuestion.dataValues.optionType === 'MultipleChoice') {
                            optionType1 = req.body['answer' + i].slice(0, 7) + 'ResponseCount';
                        } else {
                            optionType1 = qandaArray[i].answer + 'ResponseCount';
                        }

                        dbQuestion.dataValues[optionType1] += 1;
                        var updatedQuestion = {};
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
                include: [{ model: db.User, as: 'User', attributes: ['name', 'emailAddress'] }],
            }).then((dbSurvey) => {
                dbSurvey.dataValues.respondentCount += 1;
                const updatedSurvey = {
                    respondentCount: dbSurvey.dataValues.respondentCount,
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
                    var userEmail = dbSurvey.dataValues.User.emailAddress;
                    var userName = dbSurvey.dataValues.User.name.split(' ')[0];
                    var subject = 'New Response Notification';
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
});

// Render Document (public facing)
router.get('/responses/:surveyId/view', (req, res) => {
    db.Response.findAll({
        where: {
            SurveySurveyId: req.params.surveyId,
        },
        include: [
            { model: db.Question, as: 'Question', attributes: ['questionId', 'question', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4'] },
            { model: db.Respondent, as: 'Respondent', attributes: ['respondentId', 'respondentName', 'respondentEmail', 'respondentPhone'] },
            { model: db.Survey, as: 'Survey', attributes: ['surveyId', 'surveyName', 'respondentCount', 'recipientCount', 'questionCount'] },
        ],
    }).then(function(responses) {
        res.json(responses);
    }).catch(function(err) {
        res.render('error', err);
    });
});

// Get Route to Profile page
router.get('/profile', (req, res) => {
    db.User
        .findByPk(req.session.globalUser.userId)
        .then((dbUser) => {
            const hbsObject = dbUser.dataValues;
            delete hbsObject.password;
            hbsObject['initials'] = hbsObject.name.split(' ')[0][0] + hbsObject.name.split(' ')[1][0];
            res.render('user/profile', hbsObject);
        });
});

router.get('/complete', (req, res) => {
    return res.render('survey/complete', { layout: false });
});

// Get all QuestionIds for a survey and count number of options specified
router.get('/chart/:surveyId', (req, res) => {
    var results = {
        surveyId: req.params.surveyId,
        optionType: [],
        answerCounts: [],
    };
    db.Question.findAll({
        where: { SurveySurveyId: req.params.surveyId },
        attributes: ['optionType', 'YesResponseCount', 'NoResponseCount', 'TrueResponseCount', 'FalseResponseCount'],
    }).then((dbQuestion) => {
        for (var i = 0; i < dbQuestion.length; i++) {
            var arr = Object.values(dbQuestion[i].dataValues).filter((e) => {
                return e != null;
            });
            results.optionType.push(arr.shift());
            results.answerCounts.push(arr);
        }
        return res.json(results);
    });
});

// Save New Contact Subscribe
router.post('/subscribe', [
        check('firstName').not().isEmpty().escape().withMessage('Please enter your first name'),
        check('lastName').not().isEmpty().escape().withMessage('Please enter your last name'),
        check('email').not().isEmpty().escape().isEmail().normalizeEmail().withMessage('Please enter your email address'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.layout = 'partials/prelogin';
            errors.firstName = req.body.firstName;
            errors.lastName = req.body.lastName;
            errors.email = req.body.email;
            errors.showModal = true;
            return res.render('auth/signin', errors);
        } else {
            db.Contact.findOne({
                where: {
                    email: req.body.email,
                },
            }).then((dbContact) => {
                if (dbContact !== null) {
                    var duplicateMessage = {};
                    duplicateMessage.layout = 'partials/prelogin';
                    duplicateMessage.firstName = req.body.firstName;
                    duplicateMessage.lastName = req.body.lastName;
                    duplicateMessage.email = req.body.email;
                    duplicateMessage.msg = 'This email already exists in our system';
                    duplicateMessage.showModal = true;
                    return res.render('auth/signin', duplicateMessage);
                } else {
                    db.Contact.create({
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                    }).then((dbContact) => {
                        var message = {
                            showConfirmation: true,
                            layout: 'partials/prelogin',
                        };
                        // Send Email
                        const emailBody = `
                    <p>Hello ${req.body.firstName},</p>
                    <p style="color: black;">Thank you for subscribing to the SurvEnEEr mailing list. We will keep you informed about the latest features and updates.</p>
                    <span style="font-size: 1rem;color: black;"><strong>SurvEnEEr Team</strong></span>
                    `;

                        return new Promise((resolve, reject) => {
                            sendEmail(emailBody, 'Thank you for subscribing!', req.body.email);
                            return res.render('auth/signin', message);
                        });
                    }).catch((err) => {
                        res.render('error', err);
                    });
                }
            });
        }
    });

// Update contact
router.post('/updateContact', (req, res) => {
    var updatedContact = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        active: (req.body.active === 'true' ? true : false),
    };
    db.Contact.findByPk(req.body.contactId).then((dbContact) => {
        if (dbContact !== null) {
            db.Contact.update(updatedContact, {
                where: {
                    contactId: req.body.contactId,
                },
            }).then(() => {
                res.redirect('/contacts');
            }).catch((err) => {
                res.render('error', err);
            });
        }
    }).catch((err) => {
        res.render('error', err);
    });
});

// Delete Contact
router.get('/deleteContact/:contactId', (req, res) => {
    db.Contact.findByPk(req.params.contactId)
        .then((dbContact) => {
            if (dbContact !== null) {
                db.Contact.destroy({
                    where: {
                        contactId: req.params.contactId,
                    },
                }).then(() => {
                    res.redirect('/contacts');
                }).catch((err) => {
                    res.render('error', err);
                });
            }
        });
});

router.get('/sendSurvey/:surveyId', (req, res) => {
    db.Survey.findByPk(req.params.surveyId).then((dbSurvey) => {
        if (dbSurvey != null) {
            const hbsObject = {
                surveyId: dbSurvey.dataValues.surveyId,
                subject: dbSurvey.dataValues.surveyName,
            };
            Object.assign(hbsObject, req.session.globalUser);
            res.render('survey/send', hbsObject);
        }
    }).catch((err) => {
        res.render('error', err);
    });
});

router.post('/emailSurvey/:surveyId', [
        check('email').not().isEmpty().escape().isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
        check('subject').not().isEmpty().escape().withMessage('Please enter a subject for your email'),
        check('message').not().isEmpty().escape().withMessage('Please enter a message'),
        check('surveyId').not().isEmpty().escape().withMessage('Survey Id is missing, Please refresh this page and try again'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.email = req.body.email;
            errors.subject = req.body.subject;
            errors.message = req.body.message;
            errors.surveyId = req.params.surveyId;
            Object.assign(errors, req.session.globalUser);
            return res.render('survey/send', errors);
        } else {
            const emailArray = req.body.email.split(',');
            // Verify SurveyId
            db.Survey.findOne({
                where: {
                    surveyId: req.params.surveyId,
                },
            }).then((dbSurvey) => {
                if (dbSurvey == null) {
                    const errors = {};
                    errors.email = req.body.email;
                    errors.subject = req.body.subject;
                    errors.message = req.body.message;
                    errors.noSurveyError = 'Invalid Survey Id, Please go back';
                    Object.assign(errors, req.session.globalUser);
                    return res.render('survey/send', errors);
                } else {
                    const hbsObject = { surveyId: dbSurvey.dataValues.surveyId };
                    const emailBody = `
                    <span style="text-transform: uppercase; font-size: 1rem;color: black;"><strong>Surveneer</strong></span>
                    <p>Hello,</p>
                    <p style="color: black;">${req.body.message}</p>
                    <a class="btn btn-sm btn-primary" href="https://surveneer.herokuapp.com/surveys/${req.params.surveyId}/v2">Open Survey</a>
                    <p>Surveneer Team</p>
                    `;

                    return new Promise((resolve, reject) => {
                        for (var i = 0; i < emailArray.length; i++) {
                            sendEmail(emailBody, req.body.subject, emailArray[i]);
                            var recipientEmail = emailArray[i];
                            // Add email to recipient table if it doesnt exist
                            db.Recipient.findOne({
                                where: {
                                    recipientEmail: recipientEmail,
                                    SurveySurveyId: req.params.surveyId,
                                },
                            }).then((dbRecipient) => {
                                if (dbRecipient == null) {
                                    db.Recipient.create({
                                        recipientEmail: recipientEmail,
                                        UserUserId: req.session.globalUser.userId,
                                        SurveySurveyId: req.params.surveyId,
                                    });
                                }
                            });

                            // Increase Number of recipients by 1
                            dbSurvey.dataValues.recipientCount += 1;
                            const updatedSurvey = {
                                recipientCount: dbSurvey.dataValues.recipientCount,
                            };
                            db.Survey.update(updatedSurvey, {
                                where: {
                                    surveyId: dbSurvey.dataValues.surveyId,
                                },
                            });
                        } // ===For loop end
                        hbsObject['emailSentAlertMessage'] = true;
                        hbsObject['subject'] = req.body.subject;
                        Object.assign(hbsObject, req.session.globalUser);
                        res.render('survey/send', hbsObject);
                    }); // ======
                }
            }).catch((err) => {
                res.render('error', err);
            });
        }
    });

router.post('/updateRecipient/:recipientId', [
        check('recipientName').not().isEmpty().escape().withMessage('Please enter a name'),
        check('recipientEmail').not().isEmpty().escape().withMessage('Please enter an email'),
        check('recipientPhone').not().isEmpty().escape().withMessage('Please enter a phone number'),
        check('surveyId').not().isEmpty().escape().withMessage('Please select a survey'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.recipientName = req.body.recipientName;
            errors.recipientEmail = req.body.recipientEmail;
            errors.recipientPhone = req.body.recipientPhone;
            errors.displayModal = true;
            Object.assign(errors, req.session.globalUser);
            return res.render('user/contacts', errors);
        }
        db.Recipient.findOne({
            where: {
                recipientId: req.params.recipientId,
            },
        }).then((dbRecipient) => {
            if (dbRecipient !== null) {
                // Update Recipient Info
                db.Recipient.update({
                    recipientName: req.body.recipientName,
                    recipientEmail: req.body.recipientEmail,
                    recipientPhone: req.body.recipientPhone,
                    UserUserId: req.params.userId,
                    SurveySurveyId: req.body.surveyId,
                }, {
                    where: {
                        recipientId: dbRecipient.dataValues.recipientId,
                    },
                }).then((dbRecipient) => {
                    var hbsObject = { updateSuccess: true };
                    Object.assign(hbsObject, req.session.globalUser);
                    return res.render('user/contacts', hbsObject);
                });
            }
        }).catch((err) => {
            return res.render('error', err);
        });
    });

router.post('/newRecipient/:userId', [
        check('recipientName').not().isEmpty().escape().withMessage('Please enter a name'),
        check('recipientEmail').not().isEmpty().escape().withMessage('Please enter an email'),
        check('recipientPhone').not().isEmpty().escape().withMessage('Please enter a phone number'),
        check('surveyId').not().isEmpty().escape().withMessage('Please select a survey'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.recipientName = req.body.recipientName;
            errors.recipientEmail = req.body.recipientEmail;
            errors.recipientPhone = req.body.recipientPhone;
            errors.displayModal = true;
            Object.assign(errors, req.session.globalUser);
            return res.render('user/contacts', errors);
        }
        db.Recipient.create({
            recipientName: req.body.recipientName,
            recipientEmail: req.body.recipientEmail,
            recipientPhone: req.body.recipientPhone,
            UserUserId: req.params.userId,
            SurveySurveyId: req.body.surveyId,
        }).then((dbRecipient) => {
            // console.log(dbRecipient.dataValues);
            var hbsObject = { successMessage: true };
            Object.assign(hbsObject, req.session.globalUser);
            return res.render('user/contacts', hbsObject);
        }).catch((err) => {
            return res.render('error', err);
        });
    });

router.get('/deleteRecipient/:recipientId', (req, res) => {
    db.Recipient.findByPk(req.params.recipientId).then((dbRecipient) => {
        if (dbRecipient !== null) {
            db.Recipient.destroy({
                where: {
                    recipientId: req.params.recipientId,
                },
            }).then(() => {
                var hbsObject = { deleteSuccess: true };
                Object.assign(hbsObject, req.session.globalUser);
                return res.render('user/contacts', hbsObject);
            }).catch((err) => {
                res.render('error', err);
            });
        }
    });
});

module.exports = router;