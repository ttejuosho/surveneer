const express = require('express');
const app = express();
const router = express.Router();
const db = require('../models');
const appRoot = require('app-root-path');
const passport = require('passport');
const {check, validationResult} = require('express-validator');
const nodemailer = require('nodemailer');
const transporter = require('../config/email/email');

// List of Users on SurvEnEEr
router.get('/contacts', (req, res) => {
  const hbsObject = {loadJs: 'true'};
  Object.assign(hbsObject, req.session.globalUser);
  return res.render('admin/contacts', hbsObject);
});

// Save New Contact Subscribe
router.post('/subscribe', [
  check('firstName').not().isEmpty().escape().withMessage('Please enter your first name'),
  check('lastName').not().isEmpty().escape().withMessage('Please enter your last name'),
  check('email').not().isEmpty().escape().withMessage('Please enter your email address'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.layout = 'partials/prelogin';
    errors.firstName = req.body.firstName;
    errors.lastName = req.body.lastName;
    errors.email = req.body.email;
    errors.showModal = true;
    return res.render('auth/signin', errors);
  } else {
    db.Contact.findOne({
      where: {
        email: req.body.email,
      },
    }).then((dbContact) => {
      if (dbContact !== null) {
        const duplicateMessage = {};
        duplicateMessage.layout = 'partials/prelogin';
        duplicateMessage.firstName = req.body.firstName;
        duplicateMessage.lastName = req.body.lastName;
        duplicateMessage.email = req.body.email;
        duplicateMessage.msg = 'This email already exists in our system';
        duplicateMessage.showModal = true;
        return res.render('auth/signin', duplicateMessage);
      } else {
        db.Contact.create({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
        }).then((dbContact) => {
          const message = {
            showConfirmation: true,
            layout: 'partials/prelogin',
          };
          return res.render('auth/signin', message);
        }).catch((err) => {
          res.render('error', err);
        });
      }
    });
  }
});

// Update contact
router.post('/updateContact', (req, res) => {
  const updatedContact = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    active: (req.body.active === 'true' ? true : false),
  };
  db.Contact.findByPk(req.body.contactId).then((dbContact) => {
    if (dbContact !== null) {
      db.Contact.update(updatedContact, {
        where: {
          contactId: req.body.contactId,
        },
      }).then(()=>{
        res.redirect('/contacts');
      }).catch((err) => {
        res.render('error', err);
      });
    }
  }).catch((err) => {
    res.render('error', err);
  });
});

// Delete Contact
router.get('/deleteContact/:contactId', (req, res) => {
  db.Contact.findByPk(req.params.contactId)
      .then((dbContact) => {
        if (dbContact !== null) {
          db.Contact.destroy({
            where: {
              contactId: req.params.contactId,
            },
          }).then(()=>{
            res.redirect('/contacts');
          }).catch((err) => {
            res.render('error', err);
          });
        }
      });
});

module.exports = router;
