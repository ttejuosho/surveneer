var express = require("express");
var path = require('path');
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var passport = require('passport')
var session = require('express-session')
var db = require("./models");
var app = express();
const multer = require('multer');

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(__dirname + "/public"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

// override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

// For Passport
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
      cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });

// Init Upload
const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
    fileFilter: function(req, file, cb){
      checkFileType(file, cb);
    }
  }).single('profileImage');

// Check File Type
function checkFileType(file, cb){
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);
  
    if(mimetype && extname){
      return cb(null,true);
    } else {
      cb('Error: Images Only!');
    }
  }

var exphbs = require("express-handlebars");

var hbs = exphbs.create({
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
            return obj.length
        },
        increment: function(value, options) {
            var c = 0;
            return c += 1;
        }
    },
    defaultLayout: "main"
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
var routes = require("./controllers/survenaire_controller");

require('./routes/auth.js')(app, passport);

//load passport strategies
require('./config/passport/passport.js')(passport, db.User);

require("./routes/api-routes.js")(app);
require('./routes/auth')(app);
app.use("/", routes);
app.use("/update", routes);
app.use("/new", routes);
app.use("/delete", routes);
app.use("/survey", routes);
app.use("/question", routes);

// listen on port 3000
var port = process.env.PORT || 3000;
db.sequelize.sync().then(function() {
    app.listen(port);
}).catch(function(err) {
    console.log(err, "Oh no !! Something went wrong with the Database!");
});