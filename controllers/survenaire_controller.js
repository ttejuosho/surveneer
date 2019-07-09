var express = require("express");
var router = express.Router();
var db = require("../models");


router.get('/', (req, res) => {
    res.redirect('/index');
});

router.get('/index', (req, res) => {
    return res.render("index");
});

router.get('/surveys', (req, res) => {
    db.Survey.findAll({})
        .then((dbSurvey) => {
            var surveys = {
                survey: dbSurvey
            };
        return res.render("surveys", surveys);
    });
});

// router.get('/survey/:id', (req, res) => {
//     db.Survey.findOne({
//         where: {
//             id: req.params.id
//         }
//         }).then((dbSurvey) => {
//         res.render('survey/survey', dbSurvey.dataValues);
//     }).catch((err) => {
//         res.render('error', err);
//     });
// });

router.get('/survey/new', (req, res) => {
    return res.render("survey/new");
});

//New Survey POST Route
router.post('/survey/new', (req, res) => {
    //Validate Survey Name
    if (req.body.surveyName == "") {
        var err = {
            surveyNameError: "Survey Name is required."
        }
        res.render("survey/new", err);
    } else {
        //Check for duplicate Survey Name
        db.Survey.findOne({
            where: {
                surveyName: req.body.surveyName
            }
        }).then((dbSurvey) => {
            if (dbSurvey == null) {
                db.Survey.create({
                    surveyName: req.body.surveyName,
                    getId: req.body.getId,
                    surveyNotes: req.body.surveyNotes
                }).then((dbSurvey) => {
        //set the Id in the returned object as SurveyId (Object Destructuring)
                    const {
                        id,
                        ...hbsObject
                    } = dbSurvey.dataValues;
                    hbsObject.SurveyId = dbSurvey.dataValues.id;
                    console.log(hbsObject);
                    return res.render('question/new', hbsObject);
                }).catch((err) => {
                    res.render('error', err);
                });
            } else {
                var err = {
                    error: dbSurvey.surveyName.toLowerCase() + " already exists, please choose another name for your survey."
                }
                res.render("survey/new", err);
            }
        });
    }
});

router.get('/question/new/:SurveyId', (req, res) => {
    var hbsObject = { SurveyId: req.params.SurveyId }
    return res.render("question/new", hbsObject );
});

router.get('/questions/:id/update', (req,res)=>{
      db.Question
        .findByPk(req.params.id)
        .then( (dbQuestion) => {
            //console.log(dbQuestion.dataValues);
     res.render('question/update', dbQuestion.dataValues);
    });
});

//Edit Route for Questions
router.put('/questions/:id/update', (req, res) => {
    const dbQuestion = {
        question: req.body.question,
        options: req.body.options
    };
    db.Question.update( dbQuestion, {
        where: {
            id: req.params.id
        }
    }).then( (dbQuestion) => {
        res.redirect('/mysurveys/' + req.body.SurveyId);
    }).catch((err) => {
		res.render('error', err);
	});
});

//Delete Route for Questions
router.get('/questions/:id/delete', (req, res) => {
    db.Question.findByPk(req.params.id)
               .then( (dbQuestion) => {
                   var SurveyId = dbQuestion.SurveyId;
                   //console.log(SurveyId);
                   db.Question.destroy({
                       where: {
                           id: dbQuestion.dataValues.id
                       }
             }).then( () => { res.redirect('/mysurveys/' + SurveyId) })
             }).catch((err) => { res.render('error', err)
             });
    });

//Improvise Adapt & Overcome
//Delete Route for Survey
router.get('/surveys/:id/delete', (req, res) => {
    db.Survey.findByPk(req.params.id)
             .then( (dbSurvey) => {
                 db.Survey.destroy({
                     where: {
                         id: dbSurvey.dataValues.id
                     }
           }).then( () => { res.redirect('/surveys') })
           }).catch((err) => { res.render('error', err)
           });
    });

router.post('/question/new/:SurveyId', (req, res) => {
    //TODO:    Validate Received SurveyId HERE

    //Validate Survey Name
    if (req.body.question == "") {
        var err = {
            questionError: "Please enter a question.",
            SurveyId: req.params.SurveyId
        }
        res.render("question/new", err);
    } else if (req.body.options == "") {
        var err = {
            optionsError: "Please choose an option.",
            SurveyId: req.params.SurveyId
        }
        res.render("question/new", err);
    } else if (req.body.SurveyId == "") {
        var err = {
            error: "Survey Id is missing, Please create a new survey to add questions",
            SurveyId: req.params.SurveyId
        }
        res.render("question/new", err);
    } else {
        db.Question.create({
            question: req.body.question,
            options: req.body.options,
            SurveyId: req.params.SurveyId
        }).then((dbQuestion) => {
            return res.render('question/new', dbQuestion.dataValues);
        }).catch((err) => {
            //console.log(err);
            res.render('error', err);
        });
    }
});

//======Get All User Surveys With Questions==================
router.get('/mysurveys', function(req, res) {
    where = (req.query.where && JSON.parse(req.query.where) || null);
    db.Survey.findAll({
        where: where,
        order: req.query.order || [],
        include: [{ model: db.Question, as: "Questions", attributes: ["question", "options"] }]
    }).then(function(surveys) {
        res.json(surveys);
    }).catch(function(err) {
        res.render('error', err);
    });
});

//=================Get One User Survey With Questions==========
router.get('/mysurveys/:id', function(req, res) {
    db.Survey.findOne({
        where: {
            id: req.params.id
        },
        include: [{ model: db.Question, as: "Questions", attributes: ["id", "question", "options"] }]
    }).then(function(survey) {
        //console.log(survey.dataValues);
        res.render('survey/survey', survey.dataValues);
    }).catch(function(err) {
        res.render('error', err);
    });
});

//View Route For a Survey
router.get('/surveys/:id/view', (req, res) => {
    db.Survey.findOne({
        where: {
            id: req.params.id
        },
        include: [{ model: db.Question, as: "Questions", attributes: ["id", "question", "options"] }]
    }).then(function(survey) {
        //console.log(survey.dataValues);
        res.render('survey/view', survey.dataValues);
    }).catch(function(err) {
        res.render('error', err);
    });
});

router.post('/responses', (req, res) => {
    db.Response.create({
        question: req.body.question,
        options: req.body.options,
        SurveyId: req.params.SurveyId
    }).then((dbResponse) => {
        return res.render('question/new', dbResponse.dataValues);
    }).catch((err) => {
        res.render('error', err);
    });
});

module.exports = router;