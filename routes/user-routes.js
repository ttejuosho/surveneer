/* eslint-disable max-len */
const userController = require('../controllers/user_controller.js');
const { check } = require('express-validator');
const Security = require('../config/security/security.js');


module.exports = (app) => {
    app.get('/forgot', userController.forgot);
    app.post('/forgot', [check('emailAddress').not().isEmpty().withMessage('Please enter your email address')],
        userController.sendPasswordResetEmail);
    app.get('/reset/:token', userController.getResetPasswordPage);
    app.post('/reset/:token', [check('newPassword').not().isEmpty().withMessage('Please enter your new password'),
            check('confirmPassword').not().isEmpty().withMessage('Please confirm your new password')
        ],
        userController.resetPassword);
    app.get('/profile', Security.isLoggedIn, userController.getUserProfilePage);
    app.get('/mycontacts', Security.isLoggedIn, userController.getUserContacts);
    app.post('/userUpdate', Security.isLoggedIn, userController.updateUser);
};