var express = require("express");

var router = express.Router();
// grabbing our models
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

router.get('/question/new', (req, res) => {
    return res.render("question/new");
});

router.post('/survey/new', (req,res) => {
    console.log(req.body, "From Controller");
    db.Survey.create({
        surveyName: req.body.surveyName,
        surveyNotes: req.body.surveyNotes,
        getId: req.body.getId
    }).then((dbSurvey) => {
        return res.render('question/new', dbSurvey);
    }).catch((err) => {
        res.render('error', err);
    });  
});

module.exports = router;