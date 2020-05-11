/* eslint-disable max-len */
const db = require('../models');
const bCrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const {validationResult} = require('express-validator');
const sendEmail = require('../config/email/email.js');
const upload = require('../config/utils/utils.js');

// Get Route to Update Question
exports.getUserProfilePage = (req, res) => {
  db.User
      .findByPk(req.session.globalUser.userId)
      .then((dbUser) => {
        const hbsObject = dbUser.dataValues;
        delete hbsObject.password;
        hbsObject['initials'] = hbsObject.name.split(' ')[0][0] + hbsObject.name.split(' ')[1][0];
        res.render('user/profile', hbsObject);
      });
};

exports.forgot = (req, res) => {
  const hbsObject = {layout: 'partials/prelogin'};
  return res.render('auth/forgot', hbsObject);
};

exports.sendPasswordResetEmail = (req, res) => {
  const token = crypto.randomBytes(20).toString('hex');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.layout = 'partials/prelogin';
    return res.render('auth/forgot', errors);
  }
  db.User.findOne({
    where: {
      emailAddress: req.body.emailAddress,
    },
  }).then((dbUser) => {
    if (dbUser === null) {
      const errors = {errorMessage: 'Email not found', layout: 'partials/prelogin'};
      return res.render('auth/forgot', errors);
    }
    const userInfo = {
      userName: dbUser.dataValues.name.split(' ')[0],
      emailAddress: dbUser.dataValues.emailAddress,
      resetPasswordToken: token,
      resetPasswordExpires: Date.now() + 3600000,
    };

    const subject = 'Reset Your SurvEnEEr Password';
    const emailBody = `
        <p>Hello ${userInfo.userName},</p>
        <p style="color: black;">Ready to reset your password ?.</p>    
        <p>Click <a href="https://surveneer.herokuapp.com/reset/${token}">Reset now</a> to begin.</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <span style="font-size: 1rem;color: black;"><strong>SurvEnEEr Inc.</strong></span>
        `;

    return new Promise((resolve, reject) => {
      sendEmail(emailBody, subject, userInfo.emailAddress);
      db.User.update({resetPasswordExpires: userInfo.resetPasswordExpires, resetPasswordToken: userInfo.resetPasswordToken}, {
        where: {
          userId: dbUser.dataValues.userId,
        },
      });
      const message = {emailSent: true, errorMessage: 'Password reset email has been sent to ' + userInfo.emailAddress, layout: 'partials/prelogin'};
      return res.render('auth/forgot', message);
    });
  });
};

exports.getResetPasswordPage = (req, res) => {
  db.User.findOne({
    where: {
      resetPasswordToken: req.params.token,
    },
  }).then((dbUser) => {
    if (dbUser === null) {
      const errors = {errorMessage: 'Invalid password reset token, please request another one.', layout: 'partials/prelogin'};
      return res.render('auth/forgot', errors);
    }

    // Check if token matches
    if (!crypto.timingSafeEqual(Buffer.from(dbUser.dataValues.resetPasswordToken), Buffer.from(req.params.token))) {
      const hbsObject = {errorMessage: 'Invalid password reset token, please request another one.', layout: 'partials/prelogin'};
      return res.render('auth/forgot', hbsObject);
    }
    // Check token expiration
    if ((dbUser.dataValues.resetPasswordExpires < Date.now())) {
      const hbsObject = {errorMessage: 'Your Password reset link has expired, please request another one.', layout: 'partials/prelogin'};
      return res.render('auth/forgot', hbsObject);
    }

    const hbsObject = {token: req.params.token, layout: 'partials/prelogin'};
    return res.render('auth/reset', hbsObject);
  });
};

exports.resetPassword = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.token = req.params.token;
    errors.layout = 'partials/prelogin';
    return res.render('auth/reset', errors);
  } else if (req.body.newPassword !== req.body.confirmPassword) {
    const hbsObject = {
      token: req.params.token,
      errorMessage: 'Passwords dont match',
      layout: 'partials/prelogin',
    };
    return res.render('auth/reset', hbsObject);
  } else {
    db.User.findOne({
      where: {
        resetPasswordToken: req.params.token,
      },
    }).then((dbUser) => {
      if (dbUser === null) {
        const errors = {errorMessage: 'Email not found', layout: 'partials/prelogin'};
        return res.render('auth/forgot', errors);
      }
      if ((dbUser.dataValues.resetPasswordExpires > Date.now()) && crypto.timingSafeEqual(Buffer.from(dbUser.dataValues.resetPasswordToken), Buffer.from(req.params.token))) {
        const userPassword = bCrypt.hashSync(req.body.newPassword, bCrypt.genSaltSync(8), null);
        db.User.update({resetPasswordExpires: null, resetPasswordToken: null, password: userPassword}, {
          where: {
            userId: dbUser.dataValues.userId,
          },
        });
        const userName = dbUser.dataValues.name.split(' ')[0];
        const subject = 'Your SurvEnEEr Password has changed';
        const emailBody = `
            <p>Hello ${userName},</p>
            <p style="color: black;">Your password has been successfully reset.</p>    
            <p>Click <a href="https://surveneer.herokuapp.com/signin">here to Log In</a>.</p>
            <span style="font-size: 1rem;color: black;"><strong>SurvEnEEr Inc.</strong></span>`;
        return new Promise((resolve, reject) => {
          sendEmail(emailBody, subject, dbUser.dataValues.emailAddress);
          return res.redirect('/signin');
        });
      }
    });
  }
};

exports.getUserContacts = (req, res) => {
  const hbsObject = {loadJs: 'true'};
  Object.assign(hbsObject, req.session.globalUser);
  return res.render('user/contacts', hbsObject);
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
