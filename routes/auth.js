var authController = require('../controllers/authcontroller.js');

module.exports = function(app, passport) {

    //route for signup page
    app.get('/signup', authController.signup);

    //route for sigin page
    app.get('/signin', authController.signin);

    app.post('/signup', (req, res, next) => {
        passport.authenticate('local-signup', (err, user, info) =>{
            if (err) {
                return next(err); // will generate a 500 error
              }
              if (!user) {
                var msg = { error : 'Sign Up Failed: Username already exists', layout: 'partials/prelogin' }
                return res.render('auth/signup', msg);
              }
              req.login(user, signupErr => {
                if(signupErr){
                var msg = { error : 'Sign up Failed', layout: 'partials/prelogin' }
                return res.render('auth/signup', msg);
                } 
                res.redirect('/surveys');
              });
        })(req, res, next);
    });

    app.post('/signin', function(req, res, next) {
        passport.authenticate('local-signin', function(err, user, info) {
          if (err) {
            return next(err); // will generate a 500 error
          }
          //User is boolean
          if (!user) {
            var msg = { error : 'Your Username or Password was incorrect', layout: 'partials/prelogin' }
            return res.render('auth/signin', msg);
          }

          req.login(user, loginErr => {
            if (loginErr) {
                var msg = { error : 'Authentication Failed', layout: 'partials/prelogin' }
                return res.render('auth/signin', msg);
            }
            return res.redirect('/surveys');
          });      
        })(req, res, next);
      });

    //route for user dashboard
    app.get('/surveys', isLoggedIn, authController.surveys);

    //route for new Survey Page
    app.get('/survey/new', isLoggedIn);
    app.get('/profile', isLoggedIn);
    
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