/* eslint-disable max-len */
// const path = require('path');
// const express = require('express');
const db = require('../models');
const util = require('util');
const querystring = require('querystring');
const passport = require('passport');
const multer = require('multer');
const path = require('path');
// const io = require('socket.io');

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// Init Upload
const upload = multer({
  storage: storage,
  limits: {fileSize: 1000000},
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  },
}).single('profileImage');

// Check File Type
// eslint-disable-next-line require-jsdoc
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

exports.login = (req, res) => {
  res.redirect('/index');
};

exports.getSignupPage = (req, res) => {
  res.render('auth/signup', {title: 'Sign Up', layout: 'partials/prelogin'});
};

exports.getSigninPage = (req, res) => {
  const title = {title: 'Sign In', layout: 'partials/prelogin'};
  res.render('auth/signin', title);
};

exports.welcome = (req, res)=>{
  const title = {
    title: 'Complete',
    emailAddress: req.session.globalUser.emailAddress,
    layout: 'partials/postregister',
  };

  res.render('auth/register', title);
};

exports.surveys = function(req, res) {
  db.Survey.findAll({
    where: {
      UserUserId: req.session.globalUser.userId,
    },
  }).then((dbSurvey) => {
    const surveys = {};
    surveys['survey'] = dbSurvey;
    surveys['userId'] = req.session.globalUser.userId;
    if (req.session.globalUser) {
      Object.assign(surveys, req.session.globalUser);
    }
    return res.render('surveys', surveys);
  });
};

exports.callback = (req, res, next) => {
  passport.authenticate('auth0', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/signin');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // console.log(user);
      const returnTo = req.session.returnTo;
      delete req.session.returnTo;
      req.session.globalUser = {};
      req.session.globalUser['userId'] = user.id;
      req.session.globalUser['emailAddress'] = user.displayName;
      req.session.globalUser['profileImage'] = user.picture;
      db.User.findByPk(user.id).then((dbUser)=>{
        if (dbUser == null) {
          db.User.create({
            userId: user.id,
            emailAddress: user.displayName,
            profileImage: user.picture,
          }).then(function() {
            res.redirect(returnTo || '/welcome');
          });
        } else {
          req.session.globalUser['name'] = dbUser.dataValues.name;
          req.session.globalUser['initials'] = dbUser.dataValues.name.split(' ')[0][0] + dbUser.dataValues.name.split(' ')[1][0];
          res.redirect('/surveys');
        }
      });
    });
  })(req, res, next);
};

exports.completeRegistration = (req, res)=>{
  const updatedUserInfo = {
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
  };
  db.User.update(updatedUserInfo, {
    where: {
      userId: req.session.globalUser.userId,
    },
  }).then((dbUser) => {
    req.session.globalUser['name'] = req.body.name;
    req.session.globalUser['initials'] = req.body.name.split(' ')[0][0] + req.body.name.split(' ')[1][0];
    res.redirect('/surveys');
  }).catch((err) => {
    res.render('error', err);
  });
};

exports.updateUser = (req, res) => {
  upload(req, res, (err) => {
    const updatedUserInfo = {
      name: req.body.name,
      emailAddress: req.body.emailAddress,
      phoneNumber: req.body.phoneNumber,
    };
    // Validate User Info
    if (req.file !== undefined && req.body.profileImageRadio == undefined) {
      updatedUserInfo['profileImageError'] = 'Profile or Survey ? Which are you uploading ? ';
      Object.assign(updatedUserInfo, req.session.globalUser);
      return res.render('user/profile', updatedUserInfo);
    } else if (req.body.name == '') {
      Object.assign(updatedUserInfo, req.session.globalUser);
      updatedUserInfo['nameError'] = 'Whats your name ?';
      return res.render('user/profile', updatedUserInfo);
    } else if (req.body.emailAddress == '') {
      Object.assign(updatedUserInfo, req.session.globalUser);
      updatedUserInfo['emailAddressError'] = 'Uhm... Im going to need your email address.';
      return res.render('user/profile', updatedUserInfo);
    } else if (req.body.phoneNumber == '') {
      Object.assign(updatedUserInfo, req.session.globalUser);
      updatedUserInfo['phoneNumberError'] = 'What if I want to call you.';
      return res.render('user/profile', updatedUserInfo);
    } else {
      if (req.file !== undefined) {
        if (req.body.profileImageRadio === 'profileimage') {
          updatedUserInfo.profileImage = req.file.filename;
        } else {
          updatedUserInfo.surveyImage = req.file.filename;
          db.Survey.update(updatedUserInfo, {
            where: {
              UserUserid: req.session.passport.user,
            },
          });
        }
      }

      db.User.update(updatedUserInfo, {
        where: {
          userId: req.session.passport.user,
        },
      }).then((dbUser) => {
        res.redirect('/profile');
      }).catch((err) => {
        res.render('error', err);
      });
    }
  });
};

exports.signup = (req, res, next) => {
  upload(req, res, (err) => {
    if (req.file === undefined) {
      const msg = {
        error: 'Sign Up Failed: No Image Attached',
        layout: 'partials/prelogin',
      };
      return res.render('auth/signup', msg);
    } else if (req.body.name == '' || req.body.emailAddress == '' || req.body.phoneNumber == '') {
      const msg = {
        error: 'Name, Email, & Phone Number required',
        layout: 'partials/prelogin',
      };
      return res.render('auth/signup', msg);
    } else if (err) {
      const msg = {
        error: 'Sign Up Failed',
        layout: 'partials/prelogin',
      };
      return res.render('auth/signup', msg);
    } else {
      passport.authenticate('local-signup', (err, user, info) => {
        if (err) {
          return next(err); // will generate a 500 error
        }
        if (!user) {
          const msg = {
            error: 'Sign Up Failed: Username already exists',
            layout: 'partials/prelogin',
          };
          return res.render('auth/signup', msg);
        }
        req.login(user, (signupErr) => {
          if (signupErr) {
            const msg = {
              error: 'Sign up Failed',
              layout: 'partials/prelogin',
            };
            return res.render('auth/signup', msg);
          }

          req.session.globalUser = {};
          req.session.globalUser['userId'] = user.userId;
          req.session.globalUser['name'] = user.name;
          req.session.globalUser['emailAddress'] = user.emailAddress;
          req.session.globalUser['phoneNumber'] = user.phoneNumber;
          req.session.globalUser['profileImage'] = user.profileImage;
          req.session.globalUser['initials'] = req.session.globalUser.name.split(' ')[0][0] + req.session.globalUser.name.split(' ')[1][0];
          res.redirect('/surveys');
        });
      })(req, res, next);
    }
  });
};

exports.signin = (req, res, next) => {
  passport.authenticate('local-signin', function(err, user, info) {
    if (err) {
      return next(err); // will generate a 500 error
    }
    // User is boolean
    if (!user) {
      const msg = {
        error: 'Your Username or Password was incorrect',
        layout: 'partials/prelogin',
      };
      return res.render('auth/signin', msg);
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        const msg = {
          error: 'Authentication Failed',
          layout: 'partials/prelogin',
        };
        return res.render('auth/signin', msg);
      }

      req.session.globalUser = {};
      req.session.globalUser['userId'] = user.userId;
      req.session.globalUser['name'] = user.name;
      req.session.globalUser['emailAddress'] = user.emailAddress;
      req.session.globalUser['phoneNumber'] = user.phoneNumber;
      req.session.globalUser['profileImage'] = user.profileImage;
      req.session.globalUser['initials'] = req.session.globalUser.name.split(' ')[0][0] + req.session.globalUser.name.split(' ')[1][0];
      return res.redirect('/surveys');
    });
  })(req, res, next);
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
            process.env.NODE_ENV === 'production' ?
            `${returnTo}/` :
            `${returnTo}:${port}/`;
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
