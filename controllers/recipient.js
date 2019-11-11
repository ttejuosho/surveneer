const express = require('express');
const app = express();
const router = express.Router();
const db = require('../models');
const appRoot = require('app-root-path');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const transporter = require('../config/email/email');

router.get('/mycontacts', (req,res)=>{
    const hbsObject = { loadJs: 'true' };
    Object.assign(hbsObject, req.session.globalUser);
    return res.render('user/contacts', hbsObject);
});

router.post('/newRecipient/:userId',
[                                                                                                         
    check('recipientName').not().isEmpty().escape().withMessage('Please enter a name'),
    check('recipientEmail').not().isEmpty().escape().withMessage('Please enter an email'),
    check('recipientPhone').not().isEmpty().escape().withMessage('Please enter a phone number'),
    check('surveyId').not().isEmpty().escape().withMessage('Please select a survey'),
], 
(req,res)=>{
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
        SurveySurveyId: req.body.surveyId
    }).then((dbRecipient)=>{
        console.log(dbRecipient.dataValues);
        var hbsObject = { successMessage: true }
        Object.assign(hbsObject, req.session.globalUser);
        return res.render('user/contacts', hbsObject);
    }).catch((err)=>{
        return res.render('error', err);
    });
});

router.post('/updateRecipient/:recipientId', 
[                                                                                                 
    check('recipientName').not().isEmpty().escape().withMessage('Please enter a name'),
    check('recipientEmail').not().isEmpty().escape().withMessage('Please enter an email'),
    check('recipientPhone').not().isEmpty().escape().withMessage('Please enter a phone number'),
    check('surveyId').not().isEmpty().escape().withMessage('Please select a survey'),
], 
(req,res)=>{   
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
            recipientId: req.params.recipientId
        }
    }).then((dbRecipient)=>{
        if (dbRecipient !== null){
            // Update Recipient Info
            db.Recipient.update({
                recipientName: req.body.recipientName,
                recipientEmail: req.body.recipientEmail,
                recipientPhone: req.body.recipientPhone,
                UserUserId: req.params.userId,
                SurveySurveyId: req.body.surveyId
            },{
                where: {
                    recipientId: dbRecipient.dataValues.recipientId,
                }
            }).then((dbRecipient)=>{
                var hbsObject = { updateSuccess: true }
                Object.assign(hbsObject, req.session.globalUser);
                return res.render('user/contacts', hbsObject);
            });
        }           
    }).catch((err)=>{
        return res.render('error', err);
    });
});

router.get('/deleteRecipient/:recipientId', (req,res)=>{
    db.Recipient.findByPk(req.params.recipientId).then((dbRecipient)=>{
        if (dbRecipient !== null){
            db.Recipient.destroy({
                where: 
                { 
                    recipientId: req.params.recipientId 
                }
            }).then(()=>{
                var hbsObject = { deleteSuccess: true }
                Object.assign(hbsObject, req.session.globalUser);
                return res.render('user/contacts', hbsObject);
            }).catch((err) => {
                res.render('error', err);
            });
        }
    });
});

module.exports = router;