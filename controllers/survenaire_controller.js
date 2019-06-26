var express = require("express");

var router = express.Router();
// grabbing our models
var db = require("../models");

router.get('/', (req, res) => {
    res.redirect('/index');
});



module.exports = router;