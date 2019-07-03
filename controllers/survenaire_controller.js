var express = require("express");
var router = express.Router();
var db = require("../models");


router.get('/', (req, res) => {
    res.redirect('/index');
});

router.get('/index', (req, res) => {
    return res.render("index");
});

router.get('/survey/new', (req, res) => {
    return res.render("survey/new");
});

//New Survey POST Route
router.post('/survey/new', (req, res) => {
    //Validate Survey Name
    if (req.body.surveyName == "") {
        var err = {
            surveyNameError: "Survey Name is required."
        }
        res.render("survey/new", err);
    } else {
        //Check for duplicate Survey Name
        db.Survey.findOne({
            where: {
                surveyName: req.body.surveyName
            }
        }).then((dbSurvey) => {
            if (dbSurvey == null) {
                db.Survey.create({
                    surveyName: req.body.surveyName,
                    getId: req.body.getId,
                    surveyNotes: req.body.surveyNotes
                }).then((dbSurvey) => {
                    console.log(dbSurvey.dataValues);
                    return res.render('question/new', dbSurvey.dataValues);
                }).catch((err) => {
                    res.render('error', err);
                });
            } else {
                var err = {
                    error: dbSurvey.surveyName.toLowerCase() + " already exists, please choose another name for your survey."
                }
                res.render("survey/new", err);
            }
        });
    }
});

router.get('/question/new', (req, res) => {
    return res.render("question/new");
});

router.post('/question/new', (req, res) => {
    console.log(req.body);
        //Validate Survey Name
        if (req.body.question == "") {
            var err = {
                questionError: "Please enter a question."
            }
            res.render("question/new", err);
        }
        else if (req.body.options == ""){
            var err = {
                optionsError: "Please choose an option."
            }
            res.render("question/new", err);
        } else if (req.body.SurveyId == ""){
            var err = {
                error: "Survey Id is missing, Please create a new survey to add questions"
            }
            res.render("question/new", err);
        } else {
            db.Question.create({
                question: req.body.question,
                options: req.body.options,
                SurveyId: req.body.SurveyId
            }).then((dbQuestion) => {
                return res.render('question/new', dbQuestion.dataValues);
            }).catch((err) => {
                console.log(err);
                res.render('error', err);
            });
        }
});

module.exports = router;