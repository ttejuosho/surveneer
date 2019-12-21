const db = require('../models');
const {validationResult} = require('express-validator');

exports.newRecipient = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.recipientName = req.body.recipientName;
    errors.recipientEmail = req.body.recipientEmail;
    errors.recipientPhone = req.body.recipientPhone;
    errors.displayModal = true;
    Object.assign(errors, req.session.globalUser);
    return res.render('user/contacts', errors);
  }
  db.Recipient.create({
    recipientName: req.body.recipientName,
    recipientEmail: req.body.recipientEmail,
    recipientPhone: req.body.recipientPhone,
    UserUserId: req.params.userId,
    SurveySurveyId: req.body.surveyId,
  }).then((dbRecipient) => {
    // console.log(dbRecipient.dataValues);
    const hbsObject = {successMessage: true};
    Object.assign(hbsObject, req.session.globalUser);
    return res.render('user/contacts', hbsObject);
  }).catch((err) => {
    return res.render('error', err);
  });
};

exports.updateRecipient = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.recipientName = req.body.recipientName;
    errors.recipientEmail = req.body.recipientEmail;
    errors.recipientPhone = req.body.recipientPhone;
    errors.displayModal = true;
    Object.assign(errors, req.session.globalUser);
    return res.render('user/contacts', errors);
  }
  db.Recipient.findOne({
    where: {
      recipientId: req.params.recipientId,
    },
  }).then((dbRecipient) => {
    if (dbRecipient !== null) {
      // Update Recipient Info
      db.Recipient.update({
        recipientName: req.body.recipientName,
        recipientEmail: req.body.recipientEmail,
        recipientPhone: req.body.recipientPhone,
        UserUserId: req.params.userId,
        SurveySurveyId: req.body.surveyId,
      }, {
        where: {
          recipientId: dbRecipient.dataValues.recipientId,
        },
      }).then((dbRecipient) => {
        const hbsObject = {updateSuccess: true};
        Object.assign(hbsObject, req.session.globalUser);
        return res.render('user/contacts', hbsObject);
      });
    }
  }).catch((err) => {
    return res.render('error', err);
  });
};

exports.deleteRecipient = (req, res) => {
  db.Recipient.findByPk(req.params.recipientId).then((dbRecipient) => {
    if (dbRecipient !== null) {
      db.Recipient.destroy({
        where: {
          recipientId: req.params.recipientId,
        },
      }).then(() => {
        const hbsObject = {deleteSuccess: true};
        Object.assign(hbsObject, req.session.globalUser);
        return res.render('user/contacts', hbsObject);
      }).catch((err) => {
        res.render('error', err);
      });
    }
  });
};
