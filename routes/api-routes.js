/* eslint-disable max-len */
// Requiring our models
const db = require('../models');
// Routes
// =============================================================
module.exports = (app) => {
  // Get a User
  app.get('/api/users/:userId', (req, res) => {
    db.User.findAll({
      where: {
        userId: req.params.userId,
      },
      attributes: {
        exclude: ['password'],
      },
    }).then(function(dbUser) {
      res.json(dbUser);
    });
  });

  // Get a User
  app.get('/api/users/email/:emailAddress', (req, res) => {
    db.User.findAll({
      where: {
        emailAddress: req.params.emailAddress,
      },
      attributes: {
        exclude: ['password'],
      },
    }).then(function(dbUser) {
      res.json(dbUser);
    });
  });

  // Get all Users
  app.get('/api/users', (req, res) => {
    db.User.findAll({
      attributes: {
        exclude: ['password'],
      },
    }).then(function(dbUser) {
      res.json(dbUser);
    });
  });

  // Get all Surveys by a User
  app.get('/api/getUserSurveys/:userId', (req, res) => {
    db.Survey.findAll({
      where: {
        UserUserId: req.params.userId,
      },
    }).then(function(dbSurvey) {
      res.json(dbSurvey);
    });
  });

  // Create a Survey
  app.post('/api/surveys', (req, res) => {
    db.Survey.create({
      surveyName: req.body.surveyName,
      surveyBrandname: req.body.surveyBrandname,
      surveyNotes: req.body.surveyNotes,
      getId: req.body.getId,
    }).then((dbSurvey) => {
      res.json(dbSurvey);
    });
  });

  // Get all Users
  app.get('/api/users', (req, res) => {
    db.User.findAll().then(function(dbUser) {
      res.json(dbUser);
    });
  });

  // Create a User
  app.post('/api/newUser', (req, res) => {
    db.User.create({
      userId: req.body.userId,
      name: req.body.name,
      emailAddress: req.body.emailAddress,
      password: req.body.password,
      phoneNumber: req.body.phoneNumber,
      active: req.body.active,
      profileImage: req.body.profileImage,
    }).then((dbUser)=>{
      res.json(dbUser);
    });
  });

  // Get a User information
  app.get('/api/getUser/:userId', (req, res)=>{
    db.User.findByPk(req.params.userId)
        .then((dbUser)=>{
          res.json(dbUser);
        });
  });

  // Find a user by email
  app.get('/api/findUser/:emailAddress', (req, res)=>{
    db.User.findOne({
      where: {
        emailAddress: req.params.emailAddress,
      },
    }).then((dbUser)=>{
      res.json(dbUser);
    });
  });

  // Get All User Surveys With Questions
  app.get('/api/mysurveys', function(req, res) {
    where = (req.query.where && JSON.parse(req.query.where) || null);
    db.Survey.findAll({
      where: where,
      order: req.query.order || [],
      include: [{model: db.Question, as: 'Questions', attributes: ['questionId', 'question', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4']}],
    }).then(function(surveys) {
      res.json(surveys);
    }).catch(function(err) {
      res.json('error', err);
    });
  });

  // Get 1 User Survey With Questions & Responses
  app.get('/api/mysurveys/:surveyId', function(req, res) {
    db.Survey.findOne({
      where: {
        surveyId: req.params.surveyId,
      },
      include: [
        {model: db.Question, as: 'Questions', attributes: ['questionId', 'question', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4', 'YesResponseCount', 'NoResponseCount', 'TrueResponseCount', 'FalseResponseCount']},
        {model: db.Response, as: 'Responses', attributes: ['QuestionQuestionId', 'RespondentRespondentId', 'answer']},
        {model: db.Respondent, as: 'Respondents', attributes: ['respondentId', 'respondentName', 'respondentEmail', 'respondentPhone']},
      ],
    }).then(function(survey) {
      res.json(survey);
    }).catch(function(err) {
      res.json('error', err);
    });
  });

  // Get Responses by Survey ID
  app.get('/api/questions/:questionId', (req, res) => {
    db.Question.findOne({
      where: {
        questionId: req.params.questionId,
      },
      include: [
        {model: db.Survey, as: 'Survey', attributes: ['surveyName', 'respondentCount', 'surveyNotes']},
        {model: db.Response, as: 'Responses', attributes: ['answer']},
      ],
    }).then(function(dbQuestion) {
      res.json(dbQuestion);
    });
  });
  // ======================= QUESTIONS API Routes ================================

  // Get all Questions
  app.get('/api/questions', (req, res) => {
    db.Question.findAll({}).then(function(dbQuestion) {
      res.json(dbQuestion);
    });
  });

  // Get a question by Id
  app.get('/api/questions/:questionId', (req, res) => {
    db.Question.findOne({
      where: {
        questionId: req.params.questionId,
      },
    }).then(function(Question) {
      res.json(Question);
    });
  });

  // Create a new question
  app.post('/api/question/:surveyId', (req, res) => {
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
      res.json(dbQuestion);
    });
  });

  // Create a new respondent
  app.post('/api/respondent/:SurveyId', (req, res) => {
    db.Respondent.create({
      respondentName: req.body.respondentName,
      respondentEmail: req.body.respondentEmail,
      respondentPhone: req.body.respondentPhone,
      SurveySurveyId: req.params.SurveyId,
    }).then((dbRespondent) => {
      res.json(dbRespondent);
    });
  });

  // Update a Question
  app.put('/api/questions/:questionId/update', (req, res) => {
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
    db.Question.update(dbQuestion, {
      where: {
        questionId: req.params.questionId,
      },
    }).then((dbQuestion) => {
      res.json(dbQuestion);
    });
  });

  // Get all questions for a survey
  app.get('/api/survey/questions/:SurveyId', (req, res) => {
    db.Question.findAll({
      where: {
        SurveySurveyId: req.params.SurveyId,
      },
    }).then(function(dbQuestion) {
      res.json(dbQuestion);
    });
  });

  // Get Number of Responses to a Survey
  app.get('/api/rnum/:surveyId', (req, res) => {
    db.Response.count({distinct: true, col: 'RespondentRespondentId'}).then(function(dbResponse) {
      res.json(dbResponse);
    });
  });

  // Get Number of Questions on a Survey
  app.get('/api/qnum/:surveyId', (req, res) => {
    db.Question.count({where: {SurveySurveyId: req.params.surveyId}, col: 'SurveySurveyId'}).then((dbQuestion) => {
      res.json(dbQuestion);
    });
  });

  // Update number of respondents
  app.get('/api/survey/newRespondent/:surveyId', (req, res) => {
    db.Survey.findOne({
      where: {
        surveyId: req.params.surveyId,
      },
    }).then((dbSurvey) => {
      dbSurvey.dataValues.respondentCount += 1;
      const updatedSurvey = {
        surveyName: dbSurvey.dataValues.surveyName,
        getId: dbSurvey.dataValues.getId,
        respondentCount: dbSurvey.dataValues.respondentCount,
        surveyInstructions: dbSurvey.dataValues.surveyInstructions,
        surveyNotes: dbSurvey.dataValues.surveyNotes,
      };
      db.Survey.update(updatedSurvey, {
        where: {
          surveyId: dbSurvey.dataValues.surveyId,
        },
      }).then((dbSurvey) => {
        res.json(dbSurvey);
      });
    });
  });

  // Update number of questions
  app.get('/api/survey/newQuestion/:surveyId', (req, res) => {
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
        surveyInstructions: dbSurvey.dataValues.surveyInstructions,
        surveyNotes: dbSurvey.dataValues.surveyNotes,
      };
      db.Survey.update(updatedSurvey, {
        where: {
          surveyId: dbSurvey.dataValues.surveyId,
        },
      }).then((dbSurvey) => {
        res.json(dbSurvey);
      });
    });
  });

  // Get all responses to a survey from 1 respondent
  app.get('/api/getResponses/:surveyId/:respondentId', (req, res) => {
    db.Response.findAll({
      where: {
        SurveySurveyId: req.params.surveyId,
        RespondentRespondentId: req.params.respondentId,
      },
      // include: [{ association: 'Respondent' }]
      include: [{model: db.Respondent, as: 'Respondent', attributes: ['respondentName', 'respondentEmail', 'respondentPhone']}, {model: db.Question, as: 'Question', attributes: ['question']}],
    }).then((dbRespondent) => {
      // dbRespondent.push(d);
      res.json(dbRespondent);
    });
  });

  // Get all responses to a survey from a respondent and total Number of responses
  app.get('/api/getResponse/:surveyId/:respondentId', (req, res) => {
    const data = [];
    db.Survey.findOne({
      where: {
        SurveyId: req.params.surveyId,
      },
    }).then((dbSurvey) => {
      d = dbSurvey.respondentCount;
    }).then(() => {
      db.Response.findAll({
        where: {
          SurveySurveyId: req.params.surveyId,
          RespondentRespondentId: req.params.respondentId,
        },
        include: [
          {model: db.Respondent, as: 'Respondent', attributes: ['respondentName', 'respondentEmail', 'respondentPhone']},
          {model: db.Question, as: 'Question'},
        ],
      }).then((dbRespondent) => {
        data.push([{respondentCount: d}]);
        data.push(dbRespondent);
        res.json(data);
      });
    });
  });

  // Get All Respondents to a Survey
  app.get('/api/getRespondents/:surveyId', (req, res) => {
    db.Respondent.findAll({
      where: {
        SurveySurveyId: req.params.surveyId,
      },
    }).then((dbRespondent) => {
      res.json(dbRespondent);
    });
  });

  // Get all responses to a question with Survey Information
  app.get('/api/question/response/:questionId', (req, res) => {
    db.Response.findAll({
      where: {
        QuestionQuestionId: req.params.questionId,
      },
      include: [{model: db.Survey, as: 'Survey', attributes: ['surveyName', 'respondentCount', 'surveyNotes']}],
    }).then((dbQuestion) => {
      res.json(dbQuestion);
    });
  });

  // Get all responses for a survey and see respondents
  app.get('/api/survey/response/:surveyId', (req, res) => {
    db.Response.findAll({
      where: {
        SurveySurveyId: req.params.surveyId,
      },
      include: [
        {model: db.Survey, as: 'Survey', attributes: ['surveyName', 'respondentCount', 'surveyNotes']},
        {model: db.Respondent, as: 'Respondent', attributes: ['respondentName', 'respondentEmail', 'respondentPhone']},
      ],
    }).then((dbResponse) => {
      res.json(dbResponse);
    });
  });

  // Get all questions,responses and respondents for a survey
  app.get('/api/survey/:surveyId', (req, res) => {
    db.Survey.findOne({
      where: {
        surveyId: req.params.surveyId,
      },
      include: [
        {model: db.User, as: 'User', attributes: ['name', 'emailAddress']},
        {model: db.Response, as: 'Responses', attributes: ['QuestionQuestionId', 'RespondentRespondentId', 'answer']},
        {model: db.Respondent, as: 'Respondents', attributes: ['respondentId', 'respondentName', 'respondentEmail', 'respondentPhone']},
        {model: db.Question, as: 'Questions', attributes: ['questionId', 'question', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4', 'YesResponseCount', 'NoResponseCount', 'TrueResponseCount', 'FalseResponseCount']},
      ],
    }).then((dbResponse) => {
      res.json(dbResponse);
    });
  });

  // Get All QuestionIds for a survey
  app.get('/api/survey/qids/:surveyId', (req, res) => {
    db.Question.findAll({
      where: {SurveySurveyId: req.params.surveyId},
      attributes: ['QuestionId'],
    }).then((dbQuestion) => {
      const qidArray = [];
      for (let i = 0; i < dbQuestion.length; i++) {
        qidArray.push(dbQuestion[i].QuestionId);
      }
      res.json(dbQuestion);
    });
  });

  // Get all Responses to a question
  app.get('/api/survey/res2aq/:surveyId/:questionId/:option', (req, res) => {
    db.Response.findAll({
      where: {
        SurveySurveyId: req.params.surveyId,
        QuestionQuestionId: req.params.questionId,
        answer: req.params.option,
      },
    }).then((dbResponse) => {
      res.json(dbResponse.count);
    });
  });

  // Get all QuestionIds for a survey and count number of options specified
  app.get('/api/optionCount/:surveyId', (req, res) => {
    db.Question.findAll({
      where: {SurveySurveyId: req.params.surveyId},
      attributes: ['questionId', 'YesResponseCount', 'NoResponseCount', 'TrueResponseCount', 'FalseResponseCount'],
    }).then((dbQuestion) => {
      return res.json(dbQuestion);
    });
  });

  app.get('/api/charts/optionCounts/:surveyId', (req, res) => {
    const results = {
      surveyId: req.params.surveyId,
      optionType: [],
      answerCounts: [],
    };
    db.Question.findAll({
      where: {SurveySurveyId: req.params.surveyId},
      attributes: ['optionType', 'YesResponseCount', 'NoResponseCount', 'TrueResponseCount', 'FalseResponseCount'],
    }).then((dbQuestion) => {
      for (let i = 0; i < dbQuestion.length; i++) {
        const arr = Object.values(dbQuestion[i].dataValues).filter((e) => {
          return e != null;
        });
        results.optionType.push(arr.shift());
        results.answerCounts.push(arr);
      }
      return res.json(results);
    });
  });

  // GET route for getting all of the Mailing List items
  app.get('/api/contacts', function(req, res) {
    db.Contact.findAll({})
        .then(function(dbContact) {
          res.json(dbContact);
        });
  });

  // GET route for getting a contact by ID in the mailing list
  app.get('/api/contact/:contactId', function(req, res) {
    db.Contact.findOne({
      where: {
        contactId: req.params.contactId,
      },
    }).then(function(dbContact) {
      if (dbContact !== null) {
        res.json(dbContact);
      } else {
        res.json({Error: 'Contact doesn\'t exist'});
      }
    });
  });

  // GET route for getting a contact by email in the mailing list
  app.get('/api/contact/email/:email', function(req, res) {
    db.Contact.findOne({
      where: {
        email: req.params.email,
      },
    }).then(function(dbContact) {
      if (dbContact !== null) {
        res.json(dbContact);
      } else {
        res.json({Error: 'Contact doesn\'t exist'});
      }
    });
  });

  // POST route saving for new Contact
  app.post('/api/subscribe', function(req, res) {
    db.Contact.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    }).then(function(dbContact) {
      res.json(dbContact);
    });
  });

  // Route to Edit Contact
  app.put('/api/contact/:contactId', (req, res) => {
    const updatedContactInfo = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    };
    db.Contact.update(updatedContactInfo, {
      where: {
        contactId: req.params.contactId,
      },
    }).then((dbContact) => {
      res.json(dbContact);
    }).catch(() => {
      res.json({Error: 'Error kan ti sele'});
    });
  });

  // Route to Subscribe or Unsubscribe to Contact list (Sets Active to True/False)
  app.get('/api/subscribe/:status/:contactId', (req, res) => {
    const newStatus = {active: true};
    if (req.params.status === 'false') {
      newStatus.active = false;
    }
    if (req.params.status === 'false' || req.params.status === 'true') {
      db.Contact.findByPk(req.params.contactId).then((dbContact) => {
        if (dbContact !== null) {
          db.Contact.update(newStatus, {
            where: {
              userId: req.params.userId,
            },
          }).then(function(dbUser) {
            res.json(dbUser);
          });
        }
      });
    }
  });

  // Get all Surveys by a User
  app.get('/api/getusersurveys/:userId', (req, res) => {
    db.Survey.findAll({
      where: {
        UserUserId: req.params.userId,
      },
    }).then(function(dbSurvey) {
      res.json(dbSurvey);
    });
  });

  // Get All User Surveys With Questions
  app.get('/api/mysurveys', function(req, res) {
    where = (req.query.where && JSON.parse(req.query.where) || null);
    db.Survey.findAll({
      where: where,
      order: req.query.order || [],
      include: [{model: db.Question, as: 'Questions', attributes: ['questionId', 'question', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4']}],
    }).then(function(surveys) {
      res.json(surveys);
    }).catch(function(err) {
      res.json('error', err);
    });
  });

  // Get 1 User Survey With Questions & Responses
  app.get('/api/mysurveys/:surveyId', function(req, res) {
    db.Survey.findOne({
      where: {
        surveyId: req.params.surveyId,
      },
      include: [
        {model: db.Question, as: 'Questions', attributes: ['questionId', 'question', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4', 'YesResponseCount', 'NoResponseCount', 'TrueResponseCount', 'FalseResponseCount']},
        {model: db.Response, as: 'Responses', attributes: ['QuestionQuestionId', 'RespondentRespondentId', 'answer']},
        {model: db.Respondent, as: 'Respondents', attributes: ['respondentId', 'respondentName', 'respondentEmail', 'respondentPhone']},
      ],
    }).then(function(survey) {
      res.json(survey);
    }).catch(function(err) {
      res.json('error', err);
    });
  });

  // Get Responses by Survey ID
  app.get('/api/questions/:questionId', (req, res) => {
    db.Question.findOne({
      where: {
        questionId: req.params.questionId,
      },
      include: [
        {model: db.Survey, as: 'Survey', attributes: ['surveyName', 'respondentCount', 'surveyNotes']},
        {model: db.Response, as: 'Responses', attributes: ['answer']},
      ],
    }).then(function(dbQuestion) {
      res.json(dbQuestion);
    });
  });

  // ======================= QUESTIONS API Routes ================================

  // Get all Questions
  app.get('/api/questions', (req, res) => {
    db.Question.findAll({}).then(function(dbQuestion) {
      res.json(dbQuestion);
    });
  });

  // Get a question by Id
  app.get('/api/questions/:questionId', (req, res) => {
    db.Question.findOne({
      where: {
        questionId: req.params.questionId,
      },
    }).then(function(Question) {
      res.json(Question);
    });
  });

  // Create a new question
  app.post('/api/question/:surveyId', (req, res) => {
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
      res.json(dbQuestion);
    });
  });

  // Create a new respondent
  app.post('/api/respondent/:SurveyId', (req, res) => {
    db.Respondent.create({
      respondentName: req.body.respondentName,
      respondentEmail: req.body.respondentEmail,
      respondentPhone: req.body.respondentPhone,
      SurveySurveyId: req.params.SurveyId,
    }).then((dbRespondent) => {
      res.json(dbRespondent);
    });
  });

  // Update a Question
  app.put('/api/questions/:questionId/update', (req, res) => {
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
    db.Question.update(dbQuestion, {
      where: {
        questionId: req.params.questionId,
      },
    }).then((dbQuestion) => {
      res.json(dbQuestion);
    });
  });

  // Get all questions for a survey
  app.get('/api/survey/questions/:SurveyId', (req, res) => {
    db.Question.findAll({
      where: {
        SurveySurveyId: req.params.SurveyId,
      },
    }).then(function(dbQuestion) {
      res.json(dbQuestion);
    });
  });

  // Get Number of Responses to a Survey
  app.get('/api/rnum/:surveyId', (req, res) => {
    db.Response.count({distinct: true, col: 'RespondentRespondentId'}).then(function(dbResponse) {
      res.json(dbResponse);
    });
  });

  // Get Number of Questions on a Survey
  app.get('/api/qnum/:surveyId', (req, res) => {
    db.Question.count({where: {SurveySurveyId: req.params.surveyId}, col: 'SurveySurveyId'}).then((dbQuestion) => {
      res.json(dbQuestion);
    });
  });

  // Update number of respondents
  app.get('/api/survey/newRespondent/:surveyId', (req, res) => {
    db.Survey.findOne({
      where: {
        surveyId: req.params.surveyId,
      },
    }).then((dbSurvey) => {
      dbSurvey.dataValues.respondentCount += 1;
      const updatedSurvey = {
        surveyName: dbSurvey.dataValues.surveyName,
        getId: dbSurvey.dataValues.getId,
        respondentCount: dbSurvey.dataValues.respondentCount,
        surveyInstructions: dbSurvey.dataValues.surveyInstructions,
        surveyNotes: dbSurvey.dataValues.surveyNotes,
      };
      db.Survey.update(updatedSurvey, {
        where: {
          surveyId: dbSurvey.dataValues.surveyId,
        },
      }).then((dbSurvey) => {
        res.json(dbSurvey);
      });
    });
  });

  // Update number of questions
  app.get('/api/survey/newQuestion/:surveyId', (req, res) => {
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
        surveyInstructions: dbSurvey.dataValues.surveyInstructions,
        surveyNotes: dbSurvey.dataValues.surveyNotes,
      };
      db.Survey.update(updatedSurvey, {
        where: {
          surveyId: dbSurvey.dataValues.surveyId,
        },
      }).then((dbSurvey) => {
        res.json(dbSurvey);
      });
    });
  });

  // Get all responses to a survey from 1 respondent
  app.get('/api/getResponses/:surveyId/:respondentId', (req, res) => {
    db.Response.findAll({
      where: {
        SurveySurveyId: req.params.surveyId,
        RespondentRespondentId: req.params.respondentId,
      },
      // include: [{ association: 'Respondent' }]
      include: [{model: db.Respondent, as: 'Respondent', attributes: ['respondentName', 'respondentEmail', 'respondentPhone']}, {model: db.Question, as: 'Question', attributes: ['question']}],
    }).then((dbRespondent) => {
      dbRespondent.push(d);
      res.json(dbRespondent);
    });
  });

  // Get all responses to a survey from a respondent and total Number of responses
  app.get('/api/getResponse/:surveyId/:respondentId', (req, res) => {
    const data = [];
    db.Survey.findOne({
      where: {
        SurveyId: req.params.surveyId,
      },
    }).then((dbSurvey) => {
      d = dbSurvey.respondentCount;
    }).then(() => {
      db.Response.findAll({
        where: {
          SurveySurveyId: req.params.surveyId,
          RespondentRespondentId: req.params.respondentId,
        },
        include: [
          {model: db.Respondent, as: 'Respondent', attributes: ['respondentName', 'respondentEmail', 'respondentPhone']},
          {model: db.Question, as: 'Question', attributes: ['questionId', 'question', 'optionType', 'YesResponseCount', 'NoResponseCount', 'TrueResponseCount', 'FalseResponseCount']},
        ],
      }).then((dbRespondent) => {
        data.push([{respondentCount: d}]);
        data.push(dbRespondent);
        res.json(data);
      });
    });
  });

  // Get All Respondents to a Survey
  app.get('/api/getRespondents/:surveyId', (req, res) => {
    db.Respondent.findAll({
      where: {
        SurveySurveyId: req.params.surveyId,
      },
    }).then((dbRespondent) => {
      res.json(dbRespondent);
    });
  });

  // Get all responses to a question with Survey Information
  app.get('/api/question/response/:questionId', (req, res) => {
    db.Response.findAll({
      where: {
        QuestionQuestionId: req.params.questionId,
      },
      include: [{model: db.Survey, as: 'Survey', attributes: ['surveyName', 'respondentCount', 'surveyNotes']}],
    }).then((dbQuestion) => {
      res.json(dbQuestion);
    });
  });

  // Get all responses for a survey and see respondents
  app.get('/api/survey/response/:surveyId', (req, res) => {
    db.Response.findAll({
      where: {
        SurveySurveyId: req.params.surveyId,
      },
      include: [
        {model: db.Survey, as: 'Survey', attributes: ['surveyName', 'respondentCount', 'surveyNotes']},
        {model: db.Respondent, as: 'Respondent', attributes: ['respondentName', 'respondentEmail', 'respondentPhone']},
      ],
    }).then((dbResponse) => {
      res.json(dbResponse);
    });
  });

  // Get All QuestionIds for a survey
  app.get('/api/survey/qids/:surveyId', (req, res) => {
    db.Question.findAll({
      where: {SurveySurveyId: req.params.surveyId},
      attributes: ['QuestionId'],
    }).then((dbQuestion) => {
      const qidArray = [];
      for (let i = 0; i < dbQuestion.length; i++) {
        qidArray.push(dbQuestion[i].QuestionId);
      }
      res.json(dbQuestion);
    });
  });

  // Get all Responses to a question
  app.get('/api/survey/res2aq/:surveyId/:questionId/:option', (req, res) => {
    db.Response.findAll({
      where: {
        SurveySurveyId: req.params.surveyId,
        QuestionQuestionId: req.params.questionId,
        answer: req.params.option,
      },
    }).then((dbResponse) => {
      res.json(dbResponse.count);
    });
  });

  // Get all QuestionIds for a survey and count number of options specified
  app.get('/api/optionCount/:surveyId', (req, res) => {
    db.Question.findAll({
      where: {SurveySurveyId: req.params.surveyId},
      attributes: ['questionId', 'YesResponseCount', 'NoResponseCount', 'TrueResponseCount', 'FalseResponseCount'],
    }).then((dbQuestion) => {
      return res.json(dbQuestion);
    });
  });

  app.get('/api/charts/optionCounts/:surveyId', (req, res) => {
    const results = {
      surveyId: req.params.surveyId,
      optionType: [],
      answerCounts: [],
    };
    db.Question.findAll({
      where: {SurveySurveyId: req.params.surveyId},
      attributes: ['optionType', 'YesResponseCount', 'NoResponseCount', 'TrueResponseCount', 'FalseResponseCount'],
    }).then((dbQuestion) => {
      for (let i = 0; i < dbQuestion.length; i++) {
        const arr = Object.values(dbQuestion[i].dataValues).filter((e) => {
          return e != null;
        });
        results.optionType.push(arr.shift());
        results.answerCounts.push(arr);
      }
      return res.json(results);
    });
  });

  // GET route for getting all of the Mailing List items
  app.get('/api/contacts', function(req, res) {
    db.Contact.findAll({})
        .then(function(dbContact) {
          res.json(dbContact);
        });
  });

  // GET route for getting a contact by ID in the mailing list
  app.get('/api/contact/:contactId', function(req, res) {
    db.Contact.findOne({
      where: {
        contactId: req.params.contactId,
      },
    }).then(function(dbContact) {
      if (dbContact !== null) {
        res.json(dbContact);
      } else {
        res.json({Error: 'Contact doesn\'t exist'});
      }
    });
  });

  // GET route for getting a contact by email in the mailing list
  app.get('/api/contact/email/:email', function(req, res) {
    db.Contact.findOne({
      where: {
        email: req.params.email,
      },
    }).then(function(dbContact) {
      if (dbContact !== null) {
        res.json(dbContact);
      } else {
        res.json({Error: 'Contact doesn\'t exist'});
      }
    });
  });

  // POST route saving for new Contact
  app.post('/api/subscribe', function(req, res) {
    db.Contact.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    }).then(function(dbContact) {
      res.json(dbContact);
    });
  });

  // Route to Edit Contact
  app.put('/api/contact/:contactId', (req, res) => {
    const updatedContactInfo = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    };
    db.Contact.update(updatedContactInfo, {
      where: {
        contactId: req.params.contactId,
      },
    }).then((dbContact) => {
      res.json(dbContact);
    }).catch(() => {
      res.json({Error: 'Error kan ti sele'});
    });
  });

  // Route to Subscribe or Unsubscribe to Contact list (Sets Active to True/False)
  app.get('/api/subscribe/:status/:contactId', (req, res) => {
    const newStatus = {active: true};
    if (req.params.status === 'false') {
      newStatus.active = false;
    }
    if (req.params.status === 'false' || req.params.status === 'true') {
      db.Contact.findByPk(req.params.contactId).then((dbContact) => {
        if (dbContact !== null) {
          db.Contact.update(newStatus, {
            where: {
              contactId: req.params.contactId,
            },
          }).then((dbContact) => {
            res.json(dbContact);
          });
        } else {
          res.json({Error: 'Contact doesn\'t exist'});
        }
      }).catch(() => {
        res.json({Error: 'Error kan ti sele'});
      });
    } else {
      return res.json({Error: 'Invalid Status'});
    }
  });

  app.delete('/api/deletecontact/:contactId', (req, res) => {
    db.Contact.destroy({
      where: {
        contactId: req.params.contactId,
      },
    }).then((dbContact) => {
      res.json(dbContact);
    });
  });

  // Get Recipients for a User
  app.get('/api/getRecipients/:userId', (req, res) => {
    db.Recipient.findAll({
      where: {
        UserUserId: req.params.userId,
      },
      include: [
        {model: db.Survey, as: 'Survey', attributes: ['surveyName']},
      ],
    }).then((dbRecipients) => {
      return res.json(dbRecipients);
    });
  });
};


// SELECT * FROM Answers inner join Respondents ON Answers.responsedentID = Respondents.RespondentsID inner join Questions on Questions.QuestionID = Answers.QuestionID
