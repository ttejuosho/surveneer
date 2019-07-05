// Requiring our models
var db = require("../models");

// Routes
// =============================================================
module.exports = (app) => {

//Get all Surveys
    app.get("/api/surveys", (req, res) => {
        db.Survey.findAll({}).then(function(dbSurvey) {
            res.json(dbSurvey);
        });
    });

//Get a Survey by Id
    app.get("/api/survey/:id", (req, res) => {
        db.Survey.findOne({
            where: {
                id: req.params.id
            }
        }).then(function(dbSurvey) {
            res.json(dbSurvey);
        });
    });

//Create a Survey
    app.post('/api/surveys', (req, res) => {
        db.Survey.create({
            surveyName: req.body.surveyName,
            surveyNotes: req.body.surveyNotes,
            getId: req.body.getId
        }).then((dbSurvey) => {
            res.json(dbSurvey);
        });
    });

//Get All User Surveys With Questions
app.get('/api/mysurveys', function(req, res) {
    where = ( req.query.where && JSON.parse(req.query.where) || null );
    console.log( where , "My Survey");
    db.Survey.findAll({
        where: where,
        order: req.query.order || [],
        include: [ { model: db.Question, as: "Questions", attributes: ["question", "options"] }]
    }).then(function(surveys){
        res.json(surveys);
    }).catch( function(err){
        res.json('error', err);
    });
  });

  //Get 1 User Survey With Questions
  app.get('/api/mysurveys/:id', function(req, res) {
    db.Survey.findOne({
        where: {
            id: req.params.id
        },
        include: [ { model: db.Question, as: "Questions", attributes: ["question", "options"] }]
    }).then(function(survey){
        //console.log(survey);
        res.json(survey);
    }).catch( function(err){
        res.json('error', err);
    });
  });

//======================= QUESTIONS API Routes ================================

//Get all Questions
    app.get("/api/questions", (req, res) => {
        db.Question.findAll({}).then(function(dbQuestion) {
            res.json(dbQuestion);
        });
    });

//Get a question by Id
    app.get("/api/questions/:id", (req, res) => {
        db.Question.findOne({
            where: {
                id: req.params.id
            }
        }).then(function(Question) {
            res.json(Question);
        });
    });

//Get all questions for a survey
    app.get("/api/survey/questions/:SurveyId", (req, res) => {
        db.Question.findAll({
            where: {
                SurveyId: req.params.SurveyId
            }
        }).then(function(dbQuestion) {
            res.json(dbQuestion);
        });
    });

//Create a new question
    app.post('/api/questions', (req, res) => {
        db.Question.create({
            question: req.body.question,
            options: req.body.options
        }).then((dbQuestion) => {
            res.json(dbQuestion);
        });
    });

}

// create database survenaire;
// ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root'
// begin;
// alter table questions drop column createdAt;
// alter table questions drop column updatedAt;
// commit;