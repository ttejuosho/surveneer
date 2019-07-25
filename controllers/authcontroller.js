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
    // Prints out the sessions object
    console.log(req.session);

    // Prints out the session ID
    console.log(req.session.passport.user);
    console.log("Session Id of user " + req.sessionID);

    res.render("surveys");
}

//prints out the user info from the session id
exports.sessionUserId = function(req, res) {
    //body of the session
    var sessionUser = req.session;
    //res.send(sessionUserId);

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
        res.redirect('/');
    });

}