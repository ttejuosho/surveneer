var path = require('path');
var express = require("express");
var db = require('../models');
var exports = module.exports = {}

exports.signup = function(req, res) {
    res.render("auth/signup", { title: 'Sign Up', layout: 'partials/prelogin' });
}

exports.signin = function(req, res) {
    res.render('auth/signin', { title: 'Sign In', layout: 'partials/prelogin' });
}

exports.surveys = function(req, res) {
    db.Survey.findAll({
        where: {
            UserUserId: req.session.passport.user
        }
    }).then((dbSurvey) => {
        var surveys = {};
        surveys['survey'] = dbSurvey;
        surveys['userId'] = req.session.passport.user;
        surveys['name'] = req.session.globalUser.name;
        surveys['initials'] = req.session.globalUser.initials;
        surveys['emailAddress'] = req.session.globalUser.emailAddress;
        surveys['phoneNumber'] = req.session.globalUser.phoneNumber;
        surveys['profileImage'] = req.session.globalUser.profileImage;
        return res.render("surveys", surveys);
    });
}

//prints out the user info from the session id
exports.sessionUserId = function(req, res) {
    //body of the session
    var sessionUser = req.session;

    //console.log the id of the user
    console.log(sessionUser.passport.user, " ======user id number=====");

    db.User.findAll({
        where: {
            userId: sessionUser.passport.user
        }
    }).then(function(dbUser) {
        res.json(dbUser);
    });
}

exports.logout = function(req, res) {
    req.session.destroy(function(err) {
        res.redirect('/signin');
    });
}