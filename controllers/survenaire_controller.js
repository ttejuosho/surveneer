var express = require("express");

var router = express.Router();
// grabbing our models
var db = require("../models");

router.get('/', (req, res) => {
    res.redirect('/index');
});

router.get('/index', (req,res) => {
    return res.render("index");
});


module.exports = router;