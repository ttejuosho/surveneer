/* eslint-disable max-len */
const db = require('../models');
const {validationResult} = require('express-validator');
const sendEmail = require('../config/email/email');

// Render new survey page
exports.getNewSurveyPage = (req, res) => {
  const hbsObject = {};
  Object.assign(hbsObject, req.session.globalUser);
  return res.render('survey/new', hbsObject);
};

// create New Survey POST Route
exports.newSurvey = (req, res) => {
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
          affirmation: req.body.affirmation,
          affirmationStatement: req.body.affirmationStatement,
          preSurveyInstructions: req.body.preSurveyInstructions,
          postSurveyInstructions: req.body.postSurveyInstructions,
          UserUserId: req.session.passport.user,
        }).then((dbSurvey) => {
          // increase number of surveys for user
          db.User.findByPk(req.session.passport.user).then((dbUser) => {
            dbUser.dataValues.surveyCount += 1;
            db.User.update({surveyCount: dbUser.dataValues.surveyCount}, {
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
        res.render('survey/new', err);
      }
    });
  }
};

// Get all User Surveys
exports.getUserSurveys = (req, res) => {
  db.Survey.findAll({
    where: {
      UserUserId: req.session.globalUser.userId,
    },
    order: [
      ['createdAt', 'ASC'],
    ],
  }).then((dbSurvey) => {
    const surveys = {};
    surveys['survey'] = [dbSurvey[0].dataValues, dbSurvey[1].dataValues];
    surveys['userId'] = req.session.globalUser.userId;
    console.log(surveys.survey);
    surveys.allowProtoMethodsByDefault = true;
    surveys.allowProtoPropertiesByDefault = true;
    if (req.session.globalUser) {
      Object.assign(surveys, req.session.globalUser);
    }

    return res.render('surveys', surveys);
  });
};

// Post Route to update Survey Information
exports.updateSurvey = (req, res) => {
  const updatedSurveyInfo = {
    surveyName: req.body.surveyName,
    getId: req.body.getId,
    notify: req.body.notify,
    affirmation: req.body.affirmation,
    affirmationStatement: req.body.affirmationStatement,
    acceptingResponses: req.body.acceptingResponses,
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
};

// Delete Route for Survey (Needs Revisit)
exports.deleteSurvey = (req, res) => {
  db.Response.destroy({
    where: {
      SurveySurveyId: req.params.surveyId,
    },
  });
  db.Recipient.destroy({
    where: {
      SurveySurveyId: req.params.surveyId,
    },
  });
  db.Respondent.destroy({
    where: {
      SurveySurveyId: req.params.surveyId,
    },
  });
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
};

exports.getSurveyPanel = (req, res) => {
  db.Survey.findOne({
    where: {
      surveyId: req.params.surveyId,
    },
    include: [
      {model: db.Response, as: 'Responses', attributes: ['QuestionQuestionId', 'RespondentRespondentId', 'answer']},
      {model: db.Respondent, as: 'Respondents', attributes: ['respondentId', 'respondentName', 'respondentEmail', 'respondentPhone']},
      {model: db.Question, as: 'Questions'},
    ],
    order: [
      [db.Question, 'createdAt', 'ASC'],
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
};

// Internal View for Survey
exports.viewSurvey = (req, res) => {
  db.Survey.findOne({
    where: {
      surveyId: req.params.surveyId,
    },
    include: [{model: db.Question, as: 'Questions', attributes: ['questionId', 'question', 'required', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4']}],
    order: [
      [db.Question, 'createdAt', 'ASC'],
    ],
  }).then(function(survey) {
    const hbsObject = survey.dataValues;
    Object.assign(hbsObject, req.session.globalUser);
    res.render('survey/view', hbsObject);
  }).catch(function(err) {
    res.render('error', err);
  });
};

// Respondent View for survey
exports.viewSurveyV2 = (req, res) => {
  db.Survey.findOne({
    where: {
      surveyId: req.params.surveyId,
    },
    include: [{model: db.Question, as: 'Questions', attributes: ['questionId', 'question', 'required', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4']}],
    order: [
      [db.Question, 'createdAt', 'ASC'],
    ],
  }).then(function(survey) {
    if (survey.dataValues.acceptingResponses) {
      survey.dataValues['layout'] = false;
      return res.render('survey/view2', survey.dataValues);
    } else {
      const hbsObject = {layout: false};
      return res.render('survey/closed', hbsObject);
    }
  }).catch(function(err) {
    res.render('error', err);
  });
};

// View for Send Email form and Share via Social Media
exports.getSendSurveyPage = (req, res) => {
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
};

// Post: Send survey in email
exports.emailSurvey = (req, res) => {
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
        const hbsObject = {surveyId: dbSurvey.dataValues.surveyId};
        const emailBody = `
                    <span style="text-transform: uppercase; font-size: 1rem;color: black;"><strong>Surveneer</strong></span>
                    <p>Hello,</p>
                    <p style="color: black;">${req.body.message}</p>
                    <a class="btn btn-sm btn-primary" href="https://surveneer.herokuapp.com/surveys/${req.params.surveyId}/v2">Open Survey</a>
                    <p>Surveneer Team</p>
                    `;

        return new Promise((resolve, reject) => {
          for (let i = 0; i < emailArray.length; i++) {
            sendEmail(emailBody, req.body.subject, emailArray[i]);
            const recipientEmail = emailArray[i];
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
};

// Post: Share Survey with other Surveeneer Users
exports.shareSurvey = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.username = req.body.username;
    errors.surveyId = req.params.surveyId;
    Object.assign(errors, req.session.globalUser);
    return res.render('survey/send', errors);
  } else {
    // Verify User Email
    db.User.findOne({
      where: {
        emailAddress: req.body.username,
      },
    }).then((dbUser) => {
      if (dbUser !== null) {
        db.Survey.findByPk(req.params.surveyId)
            .then((dbSurvey)=>{
              if (dbSurvey == null) {
                const errors = {};
                errors.username = req.body.username;
                errors.noSurveyError = 'Survey not found';
                Object.assign(errors, req.session.globalUser);
                return res.render('survey/send', errors);
              } else {
                db.Survey.create({
                  surveyName: dbSurvey.dataValues.surveyName,
                  getId: dbSurvey.dataValues.getId,
                  showTOU: dbSurvey.dataValues.showTOU,
                  surveyBrandname: dbSurvey.dataValues.surveyBrandname,
                  surveyTOU: req.body.surveyTOU,
                  notify: req.body.notify,
                  affirmation: req.body.affirmation,
                  affirmationStatement: req.body.affirmationStatement,
                  preSurveyInstructions: req.body.preSurveyInstructions,
                  postSurveyInstructions: req.body.postSurveyInstructions,
                  UserUserId: dbUser.dataValues.userId,
                }).then((newDbSurvey)=>{
                  db.Question.findAll({
                    where: {
                      SurveySurveyId: req.params.surveyId,
                    },
                  }).then((dbQuestion)=>{
                    for (let i = 0; i < dbQuestion.length; i++) {
                      db.Question.create({
                        question: dbQuestion[i].dataValues.question,
                        optionType: dbQuestion[i].dataValues.optionType,
                        required: dbQuestion[i].dataValues.required,
                        questionInstruction: dbQuestion[i].dataValues.questionInstruction,
                        SurveySurveyId: newDbSurvey.dataValues.surveyId,
                        option1: dbQuestion[i].dataValues.option1,
                        option2: dbQuestion[i].dataValues.option2,
                        option3: dbQuestion[i].dataValues.option3,
                        option4: dbQuestion[i].dataValues.option4,
                      });
                    }
                    // Update Question count for new survey
                    db.Survey.update({questionCount: dbQuestion.length}, {
                      where: {
                        surveyId: newDbSurvey.dataValues.surveyId,
                      },
                    });
                  });

                  // set number of surveys for the added user
                  dbUser.dataValues.surveyCount += 1;
                  db.User.update({surveyCount: dbUser.dataValues.surveyCount}, {
                    where: {
                      userId: dbUser.dataValues.userId,
                    },
                  }).then(()=>{
                    const hbsObject = {
                      surveyId: req.params.surveyId,
                      sharedAlertMessage: true,
                    };
                    Object.assign(hbsObject, req.session.globalUser);
                    return res.render('survey/send', hbsObject);
                  });
                });
              }
            });
      } else {
        const errors = {};
        errors.username = req.body.username;
        errors.noUserError = 'Email not found, Please enter a survEnEEr username';
        Object.assign(errors, req.session.globalUser);
        return res.render('survey/send', errors);
      }
    }).catch((err) => {
      res.render('error', err);
    });
  }
};
