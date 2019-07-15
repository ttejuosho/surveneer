var express = require("express");
var router = express.Router();
var db = require("../models");


router.get('/', (req, res) => {
    res.redirect('/index');
});

router.get('/index', (req, res) => {
    return res.render("index");
});

router.get('/analytics', (req, res) => {
    return res.render("survey/analytics");
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

router.get('/survey/new', (req, res) => {
    return res.render("survey/new");
});

//New Survey POST Route
router.post('/survey/new', (req, res) => {
    if (!req.body.getId) {
        req.body.getId = false;
    }
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
                //console.log(req.body);
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

                    hbsObject.SurveySurveyId = dbSurvey.dataValues.surveyId;
                    //console.log(hbsObject);
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

//Add Question to Survey Get Route
router.get('/question/new/:surveyId', (req, res) => {
    var hbsObject = { surveyId: req.params.surveyId, SurveySurveyId: req.params.surveyId }
    return res.render("question/new", hbsObject);
});

//Get Route to Update Question
router.get('/questions/:questionId/update', (req, res) => {
    db.Question
        .findByPk(req.params.questionId)
        .then((dbQuestion) => {
            //console.log(dbQuestion.dataValues);
            res.render('question/update', dbQuestion.dataValues);
        });
});

//Edit Route for Questions
router.put('/questions/:questionId/update', (req, res) => {
    const dbQuestion = {
        question: req.body.question,
        options: req.body.options
    };
    db.Question.update(dbQuestion, {
        where: {
            questionId: req.params.questionId
        }
    }).then((dbQuestion) => {
        //dbQuestion is returned which is ID of updated survey  
        res.redirect('/mysurveys/' + dbQuestion);
    }).catch((err) => {
        res.render('error', err);
    });
});

//Delete Route for Questions
router.get('/questions/:questionId/delete', (req, res) => {
    db.Question.findByPk(req.params.questionId)
        .then((dbQuestion) => {
            //console.log(dbQuestion);
            if (dbQuestion == null) {
                var err = {
                    error: "Question doesnt exist in db"
                }
            }
            var SurveyId = dbQuestion.SurveySurveyId;
            db.Question.destroy({
                where: {
                    questionId: dbQuestion.questionId
                }
            }).then(() => { res.redirect('/mysurveys/' + SurveyId) })
        }).catch((err) => {
            res.render('error', err)
        });
});

//Improvise Adapt & Overcome
//Delete Route for Survey
router.get('/surveys/:id/delete', (req, res) => {
    db.Survey.findByPk(req.params.id)
        .then((dbSurvey) => {
            db.Survey.destroy({
                where: {
                    id: dbSurvey.dataValues.id
                }
            }).then(() => { res.redirect('/surveys') })
        }).catch((err) => {
            res.render('error', err)
        });
});

router.post('/question/new/:surveyId', (req, res) => {
    //TODO:    Validate Received SurveyId HERE

    //Validate Survey Name
    if (req.body.question == "") {
        var err = {
            questionError: "Please enter a question.",
            SurveySurveyId: req.params.surveyId
        }
        res.render("question/new", err);
    } else if (req.body.options == "") {
        var err = {
            optionsError: "Please choose an option.",
            SurveySurveyId: req.params.surveyId
        }
        res.render("question/new", err);
    } else {
        db.Question.create({
            question: req.body.question,
            options: req.body.options,
            SurveySurveyId: req.params.surveyId
        }).then((dbQuestion) => {
            //console.log(dbQuestion, "LINE 181");
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
        include: [{ model: db.Question, as: "Questions", attributes: ["questionId", "question", "options"] }]
    }).then(function(surveys) {
        res.json(surveys);
    }).catch(function(err) {
        res.render('error', err);
    });
});

//=================Get One User Survey With Questions==========
router.get('/mysurveys/:surveyId', function(req, res) {
    db.Survey.findOne({
        where: {
            surveyId: req.params.surveyId
        },
        include: [{ model: db.Question, as: "Questions", attributes: ["questionId", "question", "options"] }]
    }).then(function(survey) {
        //console.log(survey.dataValues);
        res.render('survey/survey', survey.dataValues);
    }).catch(function(err) {
        res.render('error', err);
    });
});

//View Route For a Survey (Internal)
router.get('/surveys/:surveyId/view', (req, res) => {
    db.Survey.findOne({
        where: {
            surveyId: req.params.surveyId
        },
        include: [{ model: db.Question, as: "Questions", attributes: ["questionId", "question", "options"] }]
    }).then(function(survey) {
        //console.log(survey.dataValues);
        res.render('survey/view', survey.dataValues);
    }).catch(function(err) {
        res.render('error', err);
    });
});

//View Route For a Survey (Public) Without Layout
router.get('/surveys/:surveyId/view2', (req, res) => {
    db.Survey.findOne({
        where: {
            surveyId: req.params.surveyId
        },
        include: [{ model: db.Question, as: "Questions", attributes: ["questionId", "question", "options"] }]
    }).then(function(survey) {
        //console.log(survey.dataValues);
        survey.dataValues['layout'] = false;
        res.render('survey/view2', survey.dataValues);
    }).catch(function(err) {
        res.render('error', err);
    });
});

//Save Responses and Respondent (Need Refactoring - Error handling)
router.post('/responses', (req, res) => {
// console.log(req.body);
// for (var i in req.body){ 
//     if (req.body[i].length < 1) { 
//     var err = { error: "Please enter a response for all items" }
//     res.render('error', err);
//     }
// }
var qandaArray = [];
for (var i = 0; i < req.body.questionLength; i++){
    var qanda = {
        QuestionQuestionId: req.body["questionId" + i],
        answer: req.body["answer" + i],
        SurveySurveyId: req.body.surveyId
    }
    qandaArray.push(qanda);
}

//console.log(qandaArray);
for (var i = 0; i < qandaArray.length; i++){
    db.Response.create(qandaArray[i])
}

db.Respondent.create({
    respondentName: req.body.respondentName,
    respondentEmail: req.body.respondentEmail,
    respondentPhone: req.body.respondentPhone,
    SurveySurveyId: req.body.surveyId
}).then((dbRespondent) => {
    //console.log(dbRespondent.dataValues);
    return res.redirect('/mysurveys/' + req.body.surveyId);
}).catch((err) => {
    res.render('error', err);
});

});

router.get('/responses/:SurveySurveyId/view', (req, res)=>{
    db.Response.findOne({
        where: {
            SurveySurveyId: req.params.SurveySurveyId
        }
    }).then(function(responses) {
        //console.log(responses);
        res.render('response/view', responses.dataValues);
    }).catch(function(err) {
        res.render('error', err);
    });
});

module.exports = router;