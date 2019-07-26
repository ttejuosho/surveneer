var authController = require('../controllers/authcontroller.js');

module.exports = function(app, passport) {

    //route for signup page
    app.get('/signup', authController.signup);

    //route for sigin page
    app.get('/signin', authController.signin);

    //route for creating a new user
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/surveys',
        failureRedirect: '/signup'
    }));

    //post route for signin 
    app.post('/signin', passport.authenticate('local-signin', {
        successRedirect: '/surveys',
        failureRedirect: '/signin'
    }));

    //route for user dashboard
    app.get('/surveys', isLoggedIn, authController.surveys);

    //route for new Survey Page
    app.get('/survey/new', isLoggedIn);

    //route for logging out
    app.get('/logout', authController.logout);

    //======================WHERE THE MAGIC HAPPENS============================/
    //this is the route that prints out the user information from the user table
    app.get('/sessionUserId', authController.sessionUserId);

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/signin');
    }

}