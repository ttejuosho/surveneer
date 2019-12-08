const express = require('express');
const app = express();
const router = express.Router();
const db = require('../models');
const appRoot = require('app-root-path');
const passport = require('passport');
const {check, validationResult} = require('express-validator');
const nodemailer = require('nodemailer');
const transporter = require('../config/email/email');


// Get Route to Update Question
router.get('/profile', (req, res) => {
  db.User
      .findByPk(req.session.passport.user)
      .then((dbUser) => {
        const hbsObject = dbUser.dataValues;
        delete hbsObject.password;
        hbsObject['initials'] = hbsObject.name.split(' ')[0][0] + hbsObject.name.split(' ')[1][0];
        res.render('user/profile', hbsObject);
      });
});

module.exports = router;
