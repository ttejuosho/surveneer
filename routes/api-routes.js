// Requiring our models
var db = require("../models");

// Routes
// =============================================================
module.exports = (app) => {

    app.get("/api/surveys", (req, res) => {
        db.Survey.findAll({}).then(function(dbSurvey) {
            res.json(dbSurvey);
        });
    });

    app.get("/api/surveys/:id", (req, res) => {
        db.Survey.findOne({
            where: {
                id: req.params.id
            }
        }).then(function(dbSurvey) {
            res.json(dbSurvey);
        });
    });

    app.post('/api/surveys', (req, res) => {
        db.Survey.create({
            surveyName: req.body.surveyName,
            surveyNotes: req.body.surveyNotes,
            getId: req.body.getId
        }).then((dbSurvey) => {
            res.json(dbSurvey);
        });
    });

    // QUESTIONS API Routes

    app.get("/api/questions", (req, res) => {
        db.Question.findAll({}).then(function(dbQuestion) {
            res.json(dbQuestion);
        });
    });

    app.get("/api/questions/:id", (req, res) => {
        db.Question.findOne({
            where: {
                id: req.params.id
            }
        }).then(function(Question) {
            res.json(Question);
        });
    });

    app.get("/api/survey/questions/:surveyId", (req, res) => {
        db.Question.findAll({
            where: {
                SurveyId: req.params.SurveyId
            }
        }).then(function(dbQuestion) {
            res.json(dbQuestion);
        });
    });

    app.post('/api/questions', (req, res) => {
        db.Question.create({
            question: req.body.question,
            options: req.body.options
        }).then((dbQuestion) => {
            res.json(dbQuestion);
        });
    });
}