var express = require("express");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
// bring in the models
var db = require("./models");

var app = express();
// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(__dirname + "/public"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

// override with POST having ?_method=DELETE
app.use(methodOverride("_method"));
var exphbs = require("express-handlebars");

var hbs = exphbs.create({
    helpers: {
        ifEquals: function(arg1, arg2, options) {
                return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
            }
    },
    defaultLayout: "main"
});

// app.engine("handlebars", exphbs({
//     defaultLayout: "main"
// }));

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

var routes = require("./controllers/survenaire_controller");

require("./routes/api-routes.js")(app);

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
});