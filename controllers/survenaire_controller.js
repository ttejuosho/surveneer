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
router.post('/survey/new', (req,res) => {
    //Validate Survey Name
    if (req.body.surveyName == ""){
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
            if (dbSurvey == null){
                db.Survey.create({
                    surveyName: req.body.surveyName,
                    getId: req.body.getId,
                    surveyNotes: req.body.surveyNotes
                }).then((dbSurvey) => {
                    return res.render('question/new', dbSurvey);
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

router.post('/question/new', (req,res) => {
    db.Question.create({
        question: req.body.question,
        options: req.body.options
    }).then((dbQuestion) => {
        return res.render('question/new', dbQuestion);
    }).catch((err) => {
        res.render('error', err);
    }); 
});

module.exports = router;