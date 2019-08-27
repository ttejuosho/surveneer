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
    }).then(function(dbUser) {
      res.json(dbUser);
    });
  });

  // Get all Users
  app.get('/api/users', (req, res) => {
    db.User.findAll().then(function(dbUser) {
      res.json(dbUser);
    });
  });

  // Get all Surveys by a User
  app.get('/api/surveys/user/:userId', (req, res) => {
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
      surveyNotes: req.body.surveyNotes,
      getId: req.body.getId,
    }).then((dbSurvey) => {
      res.json(dbSurvey);
    });
  });

  // Get All User Surveys With Questions
  app.get('/api/mysurveys', function(req, res) {
    where = (req.query.where && JSON.parse(req.query.where) || null);
    console.log(where, 'My Survey');
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
        {model: db.Question, as: 'Questions', attributes: ['questionId', 'question', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4']},
        {model: db.Response, as: 'Responses', attributes: ['QuestionQuestionId', 'answer']},
      ],
    }).then(function(survey) {
      // console.log(survey);
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
        {model: db.Survey, as: 'Survey', attributes: ['surveyName', 'numberOfRespondents', 'surveyNotes']},
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
    db.Response.count({distinct: true, col: 'QuestionQuestionId'}).then(function(dbResponse) {
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
      dbSurvey.dataValues.numberOfRespondents += 1;
      const updatedSurvey = {
        surveyName: dbSurvey.dataValues.surveyName,
        getId: dbSurvey.dataValues.getId,
        numberOfRespondents: dbSurvey.dataValues.numberOfRespondents,
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
      dbSurvey.dataValues.numberOfQuestions += 1;
      const updatedSurvey = {
        surveyName: dbSurvey.dataValues.surveyName,
        getId: dbSurvey.dataValues.getId,
        numberOfRespondents: dbSurvey.dataValues.numberOfRespondents,
        numberOfQuestions: dbSurvey.dataValues.numberOfQuestions,
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

  // Get all responses to a survey from a respondent
  app.get('/api/getResponse/:surveyId/:respondentId', (req, res) => {
    db.Response.findAll({
      where: {
        SurveySurveyId: req.params.surveyId,
        RespondentRespondentId: req.params.respondentId,
      },
      // include: [{ association: 'Respondent' }]
      include: [{model: db.Respondent, as: 'Respondent', attributes: ['respondentName', 'respondentEmail', 'respondentPhone']}],
    }).then((dbRespondent) => {
      // for (var i = 0; i < dbRespondent.length; i++){

      // }
      res.json(dbRespondent);
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
      include: [{model: db.Survey, as: 'Survey', attributes: ['surveyName', 'numberOfRespondents', 'surveyNotes']}],
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
        {model: db.Survey, as: 'Survey', attributes: ['surveyName', 'numberOfRespondents', 'surveyNotes']},
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
        {model: db.Response, as: 'Responses', attributes: ['QuestionQuestionId', 'RespondentRespondentId', 'answer']},
        {model: db.Respondent, as: 'Respondents', attributes: ['respondentId', 'respondentName', 'respondentEmail', 'respondentPhone']},
        {model: db.Question, as: 'Questions', attributes: ['questionId', 'question', 'questionInstruction', 'optionType', 'option1', 'option2', 'option3', 'option4']},
      ],
    }).then((dbResponse) => {
      res.json(dbResponse);
    });
  });

//Get All QuestionIds for a survey
app.get('/api/survey/qids/:surveyId', (req,res) => {
  db.Question.findAll({
    where: { SurveySurveyId: req.params.surveyId },
    attributes: ['QuestionId']
  }).then((dbQuestion) => {
    var qidArray = [];
    for (var i = 0; i < dbQuestion.length; i++){
      qidArray.push(dbQuestion[i].QuestionId);
    }
    console.log(qidArray);
    res.json(dbQuestion);
  });
});

  //Get all Responses to a question
app.get('/api/survey/res2aq/:surveyId/:questionId/:option', (req,res) => {
  db.Response.findAll({
    where: {
      SurveySurveyId: req.params.surveyId,
      QuestionQuestionId: req.params.questionId,
      answer: req.params.option
    }
  }).then((dbResponse) => {
    res.json(dbResponse.count);
  });
});

//Get all QuestionIds for a survey and count number of options specified
app.get('/api/optionCount/:surveyId', (req,res) => {
  db.Question.findAll({
    where: {SurveySurveyId: req.params.surveyId},
    attributes: ['questionId', 'YesResponseCount', 'NoResponseCount', 'TrueResponseCount', 'FalseResponseCount'],
  }).then((dbQuestion) => {
    return res.json(dbQuestion);
  });
});

app.get('/api/charts/optionCounts/:surveyId', (req,res)=>{
  var results = {
    surveyId: req.params.surveyId,
    optionType: [],
    answerCounts: []
  };
  db.Question.findAll({
    where: {SurveySurveyId: req.params.surveyId},
    attributes: ['optionType','YesResponseCount', 'NoResponseCount', 'TrueResponseCount', 'FalseResponseCount'],
  }).then((dbQuestion) => {
    for (var i = 0; i < dbQuestion.length; i++){
        var arr = Object.values(dbQuestion[i].dataValues).filter((e)=>{
            return e != null;
        });
        results.optionType.push(arr.shift());
        results.answerCounts.push(arr);
    }
    return res.json(results);
  });
});

};


// SELECT * FROM Answers inner join Respondents ON Answers.responsedentID = Respondents.RespondentsID inner join Questions on Questions.QuestionID = Answers.QuestionID
