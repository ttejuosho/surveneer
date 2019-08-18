/* eslint-disable require-jsdoc */
/* eslint-disable max-len */
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const passport = require('passport');
const session = require('express-session');
const db = require('./models');
const app = express();
const multer = require('multer');
const Auth0Strategy = require('passport-auth0');
require('dotenv').config();

const strategy = new Auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      callbackURL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback',
    },
    function(accessToken, refreshToken, extraParams, profile, done) {
    /**
     * Access tokens are used to authorize users to an API
     * (resource server)
     * accessToken is the token to call the Auth0 API
     * or a secured third-party API
     * extraParams.id_token has the JSON Web Token
     * profile has all the information from the user
     */
      return done(null, profile);
    }
);

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/uploads'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.text());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'));

// For Passport
app.use(session({secret: 'keyboard cat', resave: true, saveUninitialized: false, cookie: {}})); // session secret
app.use(passport.initialize());
passport.use(strategy);
app.use(passport.session()); // persistent login sessions

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// Init Upload
const upload = multer({
  storage: storage,
  limits: {fileSize: 1000000},
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  },
}).single('profileImage');

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

const exphbs = require('express-handlebars');

const hbs = exphbs.create({
  helpers: {
    ifEquals: function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    },
    ifIncludes: function(arg1, arg2, options) {
      return (arg1.includes(arg2)) ? options.fn(this) : options.inverse(this);
    },
    counter: function(value, options) {
      return parseInt(value) + 1;
    },
    getLength: function(obj) {
      return obj.length;
    },
    increment: function(value, options) {
      let c = 0;
      return c += 1;
    },
  },
  defaultLayout: 'main',
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
const routes = require('./controllers/survenaire_controller');

require('./routes/auth.js')(upload, app, passport);

// load passport strategies
require('./config/passport/passport.js')(passport, db.User);

require('./routes/api-routes.js')(app);
// require('./routes/auth')(app);
app.use('/', routes);
app.use('/update', routes);
app.use('/new', routes);
app.use('/delete', routes);
app.use('/survey', routes);
app.use('/question', routes);
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

// listen on port 3000
const port = process.env.PORT || 3000;
db.sequelize.sync().then(function() {
  app.listen(port);
}).catch(function(err) {
  console.log(err, 'Oh no !! Something went wrong with the Database!');
});
