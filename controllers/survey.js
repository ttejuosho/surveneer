const express = require('express');
const app = express();
const router = express.Router();
const db = require('../models');
const appRoot = require('app-root-path');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const transporter = require('../config/email/email');

router.get('/newSurvey', (req, res) => {
    const hbsObject = {};
    Object.assign(hbsObject, req.session.globalUser);
    return res.render('survey/new', hbsObject);
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
                    RespondentCount: 0,
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

// =================Get One User Survey With Questions & Responses (Survey Panel)==========
router.get('/mysurveys/:surveyId', function(req, res) {
    db.Survey.findOne({
        where: {
            surveyId: req.params.surveyId,
        },
        include: [
            {model: db.Response, as: 'Responses', attributes: ['QuestionQuestionId', 'RespondentRespondentId', 'answer']},
            {model: db.Respondent, as: 'Respondents', attributes: ['respondentId', 'respondentName', 'respondentEmail', 'respondentPhone']},
            {model: db.Question, as: 'Questions', attributes: ['questionId', 'question', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4', 'YesResponseCount', 'NoResponseCount', 'TrueResponseCount', 'FalseResponseCount']},
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

// View Route For a Survey (Internal Preview)
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

// View for Send Email form and Share via Social Media
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

// Send Survey via Email POST
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
        // Verify SurveyId
        db.Survey.findOne({
            where: {
                surveyId: req.params.surveyId
            }
        }).then((dbSurvey)=>{
            if(dbSurvey == null){
                const errors = {};
                errors.email = req.body.email;
                errors.subject = req.body.subject;
                errors.message = req.body.message;
                errors.noSurveyError = 'Invalid Survey Id, Please reload the page';
                Object.assign(errors, req.session.globalUser);
                return res.render('survey/send', errors);
            } else {
                const hbsObject = { surveyId: dbSurvey.dataValues.surveyId }
        
        const output = `
        <span style="text-transform: uppercase; font-size: 1rem;color: black;"><strong>Surveneer</strong></span>
        <p>Hello,</p>
        <p style="color: black;">${req.body.message}</p>
        <a class="btn btn-sm btn-primary" href="https://surveneer.herokuapp.com/surveys/${req.params.surveyId}/view2">Open Survey</a>
        `;

        return new Promise((resolve,reject)=>{

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
                    const hbsObject = {
                        emailFailedAlertMessage: true,
                    };
                    Object.assign(hbsObject, req.session.globalUser);
                    res.render('survey/send', hbsObject);
                } else {
                    resolve(true);
                    console.log('Message ID: %s', info.messageId);                     
                    console.log(info.envelope.to.toString());

                    // Add email to recipient table if it doesnt exist
                    db.Recipient.findOne({
                        where: {
                            recipientEmail: info.envelope.to.toString(),
                            SurveySurveyId: req.params.surveyId,
                        }
                    }).then((dbRecipient)=>{
                        if (dbRecipient == null){
                            db.Recipient.create({
                                recipientEmail: info.envelope.to.toString(), 
                                UserUserId: req.session.globalUser.userId,
                                SurveySurveyId: req.params.surveyId,
                            });
                        }
                    });

                    // Increase Number of recipients by 1
                    dbSurvey.dataValues.RecipientCount += 1;
                    const updatedSurvey = {
                        RecipientCount: dbSurvey.dataValues.RecipientCount,
                    };
                    db.Survey.update(updatedSurvey, {
                        where: {
                            surveyId: dbSurvey.dataValues.surveyId,
                        },
                    });
                }
            });

        }//===For loop end
        hbsObject["emailSentAlertMessage"] = true;
        Object.assign(hbsObject, req.session.globalUser);
        res.render('survey/send', hbsObject);
    });//======
}
}).catch((err)=>{
    res.render('error', err);
});
    }
});

module.exports = router;