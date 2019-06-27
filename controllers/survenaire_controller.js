var express = require("express");

var router = express.Router();
// grabbing our models
var db = require("../models");

router.get('/', (req, res) => {
    res.redirect('/index');
});

router.get('/index', (req,res) => {
    db.Survey.findAll({})
    .then( (dbSurvey) => {
        var hbsObject = {
            survey: dbSurvey
        };
        return res.render("index", hbsObject);
    });
});


module.exports = router;