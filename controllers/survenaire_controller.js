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

router.get('/newsurvey', (req, res) => {
    return res.render("newsurvey");
});

router.post('/survey/new', (req,res) => {
    return res.render('newquestion');
})

module.exports = router;