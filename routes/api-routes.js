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

    app.get("/api/question", (req, res) => {
        db.Question.findAll({}).then(function(dbQuestion) {
        res.json(dbQuestion);
        });
    }); 

    app.post('/api/surveys', (req,res) => {
            db.Survey.create({
                surveyName: req.body.surveyName,
                surveyNotes: req.body.surveyNotes,
                getId: req.body.getId
            }).then( (dbSurvey) => {
                res.json(dbSurvey);
            });
        });
}