// Requiring our models
var db = require("../models");

// Routes
// =============================================================
module.exports = (app) => {

   app.get("/api/survey", (req, res) => {
        db.Survey.findAll({}).then(function(dbSurvey) {
        res.json(dbSurvey);
        });
    }); 

    app.get("/api/question", (req, res) => {
        db.Question.findAll({}).then(function(dbQuestion) {
        res.json(dbQuestion);
        });
    }); 

    app.post('/api/survey/new', (req,res) => {
        console.log(req.body, "from API");
                db.Survey.create({
                    surveyName: req.body.surveyName,
                    surveyNotes: req.body.surveyNotes,
                    getId: req.body.getId
                }).then( (dbSurvey) => {
                    res.json(dbSurvey);
                });
        });
}