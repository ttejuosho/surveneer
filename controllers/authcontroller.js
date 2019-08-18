// const path = require('path');
// const express = require('express');
const db = require('../models');
const util = require('util');
const querystring = require('querystring');

exports.signup = function(req, res) {
  res.render('auth/signup', {title: 'Sign Up', layout: 'partials/prelogin'});
};

exports.signin = function(req, res) {
  res.render('auth/signin', {title: 'Sign In', layout: 'partials/prelogin'});
};

exports.surveys = function(req, res) {
  db.Survey.findAll({
    where: {
      UserUserId: req.session.passport.user,
    },
  }).then((dbSurvey) => {
    const surveys = {};
    surveys['survey'] = dbSurvey;
    surveys['userId'] = req.session.passport.user;
    if (req.session.globalUser) {
      Object.assign(surveys, req.session.globalUser);
    }
    return res.render('surveys', surveys);
  });
};

// prints out the user info from the session id
exports.sessionUserId = function(req, res) {
  // body of the session
  const sessionUser = req.session;

  // console.log the id of the user
  console.log(sessionUser.passport.user, ' ======user id number=====');

  db.User.findAll({
    where: {
      userId: sessionUser.passport.user,
    },
  }).then(function(dbUser) {
    res.json(dbUser);
  });
};

// exports.logout = function(req, res) {
//   req.session.destroy(function(err) {
//     res.redirect('/signin');
//   });
// };

exports.logout = function(req, res) {
  req.logOut();

  let returnTo = req.protocol + '://' + req.hostname;
  const port = req.connection.localPort;

  if (port !== undefined && port !== 80 && port !== 443) {
    returnTo =
      process.env.NODE_ENV === 'production'
        ? `${returnTo}/`
        : `${returnTo}:${port}/`;
  }

  const logoutURL = new URL(
      util.format('https://%s/logout', process.env.AUTH0_DOMAIN)
  );
  const searchString = querystring.stringify({
    client_id: process.env.AUTH0_CLIENT_ID,
    returnTo: returnTo,
  });
  logoutURL.search = searchString;

  res.redirect(logoutURL);
};
