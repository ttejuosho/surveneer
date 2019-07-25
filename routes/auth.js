var authController = require('../controllers/authcontroller.js');

module.exports = function(app, passport){

//route for signup page
app.get('/signup', authController.signup);

//route for sigin page
app.get('/signin', authController.signin);

//route for creating a new user
app.post('/signup', passport.authenticate('local-signup',  
	{ successRedirect: '/surveys',
      failureRedirect: '/signup' }
 ));

//route for user dashboard
app.get('/surveys', isLoggedIn, authController.surveys);

//route for loging out
app.get('/logout', authController.logout);

//post route for sigin 
app.post('/signin', passport.authenticate('local-signin', 
	 { successRedirect: '/surveys',
        failureRedirect: '/signin' }
));

//======================WHERE THE MAGIC HAPPENS============================/
//this is the route that prints out the user information from the user table
app.get('/sessionUserId', authController.sessionUserId);


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/signin');
}

}