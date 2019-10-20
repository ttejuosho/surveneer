/* eslint-disable no-var */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const db = require('../models');
const appRoot = require('app-root-path');
const passport = require('passport');
const io = require('socket.io');
const { check, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
//const eht = require('nodemailer-express-handlebars');

router.get('/login', passport.authenticate('auth0', {
    scope: 'openid email profile',
}), (req, res) => {
    res.redirect('/index');
});

router.get('/', (req, res) => {
    res.redirect('/index');
});

router.get('/newSurvey', (req, res) => {
    const hbsObject = {};
    Object.assign(hbsObject, req.session.globalUser);
    return res.render('survey/new', hbsObject);
});

router.get('/contacts', (req, res) => {
    const hbsObject = { loadJs: 'true' };
    Object.assign(hbsObject, req.session.globalUser);
    return res.render('admin/contacts', hbsObject);
});

// New Survey POST Route
router.post('/newSurvey', [check('surveyName').not().isEmpty().withMessage('Please enter a name for your survey')], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        Object.assign(errors, req.session.globalUser);
        return res.render('survey/new', errors);
        // return res.status(422).jsonp(errors.array());
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
                    surveyNotes: req.body.surveyNotes,
                    surveyTOU: req.body.surveyTOU,
                    preSurveyInstructions: req.body.preSurveyInstructions,
                    postSurveyInstructions: req.body.postSurveyInstructions,
                    numberOfRespondents: 0,
                    UserUserId: req.session.passport.user,
                }).then((dbSurvey) => {
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
                    // io.emit('You have a new response to your survey');
                    return res.render('question/new', hbsObject);
                }).catch((err) => {
                    res.render('error', err);
                });
            } else {
                const err = {
                    error: dbSurvey.surveyName.toLowerCase() + ' already exists, please choose another name for your survey.',
                };
                res.render('survey/new', err);
            }
        });
    }
});

router.get('/index', (req, res) => {
    return res.render('index', req.session.globalUser);
});

router.get('/analytics', (req, res) => {
    const hbsObject = {};
    Object.assign(hbsObject, req.session.globalUser);
    return res.render('survey/analytics', hbsObject);
});

// Post Route to update Survey Information
router.post('/updateSurvey', (req, res) => {
    const updatedSurveyInfo = {
        surveyName: req.body.surveyName,
        getId: req.body.getId,
        showTOU: req.body.showTOU,
        surveyNotes: req.body.surveyNotes,
        surveyTOU: req.body.surveyTOU,
        preSurveyInstructions: req.body.preSurveyInstructions,
        postSurveyInstructions: req.body.postSurveyInstructions,
    };
    // console.log(updatedSurveyInfo);
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

// Improvise Adapt & Overcome
// Delete Route for Survey (Needs Revisit)
router.get('/deleteSurvey/:surveyId', (req, res) => {
    db.Survey.findByPk(req.params.surveyId)
        .then((dbSurvey) => {
            db.Survey.destroy({
                where: {
                    surveyId: dbSurvey.dataValues.surveyId,
                },
            }).then(() => {
                res.redirect('/surveys');
            });
        }).catch((err) => {
            res.render('error', err);
        });
});

router.post('/newQuestion/:surveyId', [
    check('question').not().isEmpty().withMessage('Please enter a question'),
    check('optionType').not().isEmpty().withMessage('Please choose an option'),
], (req, res) => {
    // TODO: Validate Received SurveyId HERE
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors['SurveySurveyId'] = req.params.surveyId;
        Object.assign(errors, req.session.globalUser);
        return res.render('question/new', errors);
        // return res.status(422).jsonp(errors.array());
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

// ======Get All User Surveys With Questions==================
// router.get('/mysurveys', function(req, res) {
//     where = (req.query.where && JSON.parse(req.query.where) || null);
//     db.Survey.findAll({
//         where: where,
//         order: req.query.order || [],
//         include: [{ model: db.Question, as: "Questions", attributes: ["questionId", "question", "questionInstruction", "optionType", "option1", "option2", "option3", "option4"] }]
//     }).then(function(surveys) {
//         res.json(surveys);
//     }).catch(function(err) {
//         res.render('error', err);
//     });
// });

// =================Get One User Survey With Questions==========
router.get('/mysurveys/:surveyId', function(req, res) {
    db.Survey.findOne({
        where: {
            surveyId: req.params.surveyId,
        },
        include: [
            { model: db.Question, as: 'Questions', attributes: ['questionId', 'question', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4'] },
            { model: db.Response, as: 'Responses', attributes: ['QuestionQuestionId', 'RespondentRespondentId', 'answer'] },
            { model: db.Respondent, as: 'Respondents', attributes: ['respondentId', 'respondentName', 'respondentEmail', 'respondentPhone'] },
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
        include: [{ model: db.Question, as: 'Questions', attributes: ['questionId', 'question', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4'] }],
    }).then(function(survey) {
        const hbsObject = survey.dataValues;
        Object.assign(hbsObject, req.session.globalUser);
        res.render('survey/view', hbsObject);
    }).catch(function(err) {
        res.render('error', err);
    });
});

// View Route For a Survey (Public) Without Layout
router.get('/surveys/:surveyId/view2', (req, res) => {
    db.Survey.findOne({
        where: {
            surveyId: req.params.surveyId,
        },
        include: [{ model: db.Question, as: 'Questions', attributes: ['questionId', 'question', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4'] }],
    }).then(function(survey) {
        survey.dataValues['layout'] = false;
        res.render('survey/view2', survey.dataValues);
    }).catch(function(err) {
        res.render('error', err);
    });
});

// Save Responses and Respondent (Need Refactoring - Error handling)
router.post('/responses', (req, res) => {
    var resId = '';
    db.Respondent.create({
        respondentName: req.body.respondentName,
        respondentEmail: req.body.respondentEmail,
        respondentPhone: req.body.respondentPhone,
        SurveySurveyId: req.body.surveyId,
    }).then((dbRespondent) => {
        resId = dbRespondent.dataValues.respondentId;
        console.log(resId);
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
            dbSurvey.dataValues.numberOfRespondents += 1;
            const updatedSurvey = {
                surveyName: dbSurvey.dataValues.surveyName,
                getId: dbSurvey.dataValues.getId,
                numberOfRespondents: dbSurvey.dataValues.numberOfRespondents,
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
                // numberOfRespondents: dbSurvey.dataValues.numberOfRespondents,
                // preSurveyInstructions: dbSurvey.dataValues.preSurveyInstructions,
                postSurveyInstructions: dbSurvey.dataValues.postSurveyInstructions,
                // surveyNotes: dbSurvey.dataValues.surveyNotes,
                layout: false,
                resId: resId,
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
            console.log(hbsObject);
            return res.render('survey/complete', hbsObject);
        });
    }).catch((err) => {
        res.render('error', err);
    });
});

router.get('/responses/:SurveySurveyId/view', (req, res) => {
    db.Response.findAll({
        where: {
            SurveySurveyId: req.params.SurveySurveyId,
        },
    }).then(function(responses) {
        res.json(responses);
        // res.render('response/view', responses.dataValues);
    }).catch(function(err) {
        res.render('error', err);
    });
});

// Get Route to Update Question
router.get('/profile', (req, res) => {
    db.User
        .findByPk(req.session.passport.user)
        .then((dbUser) => {
            const hbsObject = dbUser.dataValues;
            delete hbsObject.password;  
            hbsObject['initials'] = hbsObject.name.split(' ')[0][0] + hbsObject.name.split(' ')[1][0];
            console.log(hbsObject);
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
        console.log(results);
        return res.json(results);
    });
});

// Save New Contact Subscribe
router.post('/subscribe', [
    check('firstName').not().isEmpty().escape().withMessage('Please enter your first name'),
    check('lastName').not().isEmpty().escape().withMessage('Please enter your last name'),
    check('email').not().isEmpty().escape().withMessage('Please enter your email address'),
], (req, res) => {
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
                    console.log(dbContact.dataValues);
                    var message = {
                        showConfirmation: true,
                        layout: 'partials/prelogin',
                    };
                    return res.render('auth/signin', message);
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
        if (dbContact !== null && dbContact.dataValues.email.toLowerCase() === updatedContact.email.toLowerCase()) {
            console.log('Match Found');
            db.Contact.update(updatedContact, {
                where: {
                    contactId: req.body.contactId,
                },
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
        check('email').not().isEmpty().escape().withMessage('Please enter an email address'),
        check('subject').not().isEmpty().escape().withMessage('Please enter a subject for your email'),
        check('message').not().isEmpty().escape().withMessage('Please enter a message'),
        check('surveyId').not().isEmpty().escape().withMessage('Survey Id is missing, Please refresh this page annd try again'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            errors.email = req.body.email;
            errors.subject = req.body.subject;
            errors.message = req.body.message;
            Object.assign(errors, req.session.globalUser);
            return res.render('survey/send', errors);
        } else {
            const emailArray = req.body.email.split(',');
            const output = `
            <span style="text-transform: uppercase; font-size: 1rem;color: black;"><strong>Surveneer</strong></span>
            <p>Hello,</p>
            <p style="color: black;">${req.body.message}</p>
            <a class="btn btn-sm btn-primary" href="https://surveneer.herokuapp.com/surveys/${req.params.surveyId}/view2">Open Survey</a>
            `;

            return new Promise((resolve,reject)=>{
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: 'smtp.aol.com',
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: "ttejuosho@aol.com", // user
                    pass: process.env.EMAIL_PASSWORD // password
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // transporter.use('compile', eht({
            //     viewEngine: 'express-handlebars',
            //     viewPath: `${appRoot}/views`,
            // }));

            for (var i = 0; i < emailArray.length; i++) {
                // setup email data with unicode symbols
                let mailOptions = {
                    from: '"SurvEnEEr" <ttejuosho@aol.com>', // sender address
                    to: emailArray[i], // list of receivers
                    subject: req.body.subject, // Subject line
                    text: 'Hello world?', // plain text body
                    html: output, // html body
                    //template: 'templates/surveynotification'
                };

                // send mail with defined transport object
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        resolve(false);
                        return console.log("error : " + JSON.stringify(error));
                    } else {
                        console.log('Email sent: ' + info.response);
                        resolve(true);
                        console.log('Message ID: %s', info.messageId);
                        res.redirect('/surveys');
                    }
                });
            }//===4 loop end
        });//======
        }
    });

module.exports = router;