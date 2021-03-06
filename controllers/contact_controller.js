/* eslint-disable max-len */
const db = require('../models');
const {validationResult} = require('express-validator');
const sendEmail = require('../config/email/email.js');

exports.getContacts = (req, res)=>{
  const hbsObject = {loadJs: 'true'};
  Object.assign(hbsObject, req.session.globalUser);
  return res.render('admin/contacts', hbsObject);
};

exports.subscribe = (req, res) => {
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
          // Send Email
          const emailBody = `
                    <p>Hello ${req.body.firstName},</p>
                    <p style="color: black;">Thank you for subscribing to the SurvEnEEr mailing list. We will keep you informed about the latest features and updates.</p>
                    <span style="font-size: 1rem;color: black;"><strong>SurvEnEEr Team</strong></span>
                    `;

          return new Promise((resolve, reject) => {
            sendEmail(emailBody, 'Thank you for subscribing!', req.body.email);
            return res.render('auth/signin', message);
          });
        }).catch((err) => {
          res.render('error', err);
        });
      }
    });
  }
};

// Update Contact
exports.updateContact = (req, res) => {
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
};

// Delete contact
exports.deleteContact = (req, res) => {
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
};
