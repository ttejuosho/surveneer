var express = require("express");
var router = express.Router();
var db = require("../models");

router.get('/', (req, res) => {
    res.redirect('/index');
});

router.get('/index', (req, res) => {
    var hbsObject = { 
        name: req.session.globalUser.name,
        initials: req.session.globalUser.initials,
        emailAddress: req.session.globalUser.emailAddress,
        phoneNumber: req.session.globalUser.phoneNumber,
        profileImage: req.session.globalUser.profileImage
    }
    return res.render("index", hbsObject);
});

router.get('/analytics', (req, res) => {
    var hbsObject = { 
        name: req.session.globalUser.name,
        initials: req.session.globalUser.initials,
        emailAddress: req.session.globalUser.emailAddress,
        phoneNumber: req.session.globalUser.phoneNumber,
        profileImage: req.session.globalUser.profileImage
    }
    return res.render("survey/analytics", hbsObject);
});

router.get('/newSurvey', (req, res) => {
    var hbsObject = { 
        name: req.session.globalUser.name,
        initials: req.session.globalUser.initials,
        emailAddress: req.session.globalUser.emailAddress,
        phoneNumber: req.session.globalUser.phoneNumber,
        profileImage: req.session.globalUser.profileImage
    }
    return res.render("survey/new", hbsObject);
});

//New Survey POST Route
router.post('/newSurvey', (req, res) => {
    //Validate Survey Name
    if (req.body.surveyName === "") {
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
                    surveyNotes: req.body.surveyNotes,
                    preSurveyInstructions: req.body.preSurveyInstructions,
                    postSurveyInstructions: req.body.postSurveyInstructions,
                    numberOfRespondents: 0,
                    UserUserId: req.session.passport.user
                }).then((dbSurvey) => {
                    //set the Id in the returned object as SurveyId (Object Destructuring)
                    const {
                        id,
                        ...hbsObject
                    } = dbSurvey.dataValues;

                    hbsObject.SurveySurveyId = dbSurvey.dataValues.surveyId;
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



//Post Route to update Survey Information
router.post('/updateSurvey', (req,res) => { 
    const updatedSurveyInfo = {
        surveyName: req.body.surveyName,
        surveyNotes: req.body.surveyNotes,
        preSurveyInstructions: req.body.preSurveyInstructions,
        postSurveyInstructions: req.body.postSurveyInstructions
    }
    db.Survey.update(updatedSurveyInfo, {
        where: {
            surveyId: req.body.surveyId
        }
    }).catch((err) => {
        res.render('error', err);
    });
 });


//Add Question to Survey Get Route
router.get('/newQuestion/:surveyId', (req, res) => {
    var hbsObject = { 
        surveyId: req.params.surveyId, 
        SurveySurveyId: req.params.surveyId,
        userId: req.session.passport.user,
        name: req.session.globalUser.name,
        initials: req.session.globalUser.initials,
        emailAddress: req.session.globalUser.emailAddress,
        phoneNumber: req.session.globalUser.phoneNumber,
        profileImage: req.session.globalUser.profileImage
    }
    return res.render("question/new", hbsObject);
});

//Get Route to Update Question
router.get('/updateQuestion/:questionId', (req, res) => {
    db.Question
        .findByPk(req.params.questionId)
        .then((dbQuestion) => {
            //console.log(dbQuestion.dataValues);
            var hbsObject = dbQuestion.dataValues;
            hbsObject['initials'] = req.session.globalUser.initials;
            hbsObject['name'] = req.session.globalUser.name;
            hbsObject['emailAddress'] = req.session.globalUser.emailAddress;
            hbsObject['phoneNumber'] = req.session.globalUser.phoneNumber;
            hbsObject['profileImage'] = req.session.globalUser.profileImage;
            res.render('question/update', hbsObject);
        });
});

//Edit Route for Questions
router.put('/updateQuestion/:questionId', (req, res) => {
    const dbQuestion = {
        question: req.body.question,
        optionType: req.body.optionType,
        questionInstruction: (req.body.questionInstruction == undefined ? null : req.body.questionInstruction),
        option1: (req.body.option1 == undefined ? null : req.body.option1),
        option2: (req.body.option2 == undefined ? null : req.body.option2),
        option3: (req.body.option3 == undefined ? null : req.body.option3),
        option4: (req.body.option4 == undefined ? null : req.body.option4),
        SurveySurveyId: req.body.SurveyId,
    };
    //console.log(dbQuestion);
    db.Question.update(dbQuestion, {
        where: {
            questionId: req.params.questionId
        }
    }).then((dbQuestion) => {
        //dbQuestion is returned which is ID of updated survey  
        res.redirect('/mysurveys/' + req.body.SurveyId);
    }).catch((err) => {
        res.render('error', err);
    });
});

//Delete Route for Questions
router.get('/deleteQuestion/:questionId', (req, res) => {
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
router.get('/deleteSurvey/:surveyId', (req, res) => {
    db.Survey.findByPk(req.params.surveyId)
        .then((dbSurvey) => {
            db.Survey.destroy({
                where: {
                    surveyId: dbSurvey.dataValues.surveyId
                }
            }).then(() => { res.redirect('/surveys') })
        }).catch((err) => {
            res.render('error', err)
        });
});

router.post('/newQuestion/:surveyId', (req, res) => {
    //TODO:    Validate Received SurveyId HERE

    //Validate Survey Name
    if (req.body.question == "") {
        var err = {
            questionError: "Please enter a question.",
            SurveySurveyId: req.params.surveyId
        }
        res.render("question/new", err);
    } else if (req.body.optionType == "") {
        var err = {
            optionsError: "Please choose an option.",
            SurveySurveyId: req.params.surveyId
        }
        res.render("question/new", err);
    } else {
        //console.log(req.body);
        db.Question.create({
            question: req.body.question,
            optionType: req.body.optionType,
            questionInstruction: req.body.questionInstruction,
            SurveySurveyId: req.params.surveyId,
            option1: (req.body.option1 == undefined ? null : req.body.option1),
            option2: (req.body.option2 == undefined ? null : req.body.option2),
            option3: (req.body.option3 == undefined ? null : req.body.option3),
            option4: (req.body.option4 == undefined ? null : req.body.option4)
        }).then((dbQuestion) => {
            //After successfully saving new question, Update number of Questions on the survey
            db.Survey.findOne({
                where: {
                    surveyId: req.params.surveyId
                }
            }).then((dbSurvey) => {
                dbSurvey.dataValues.numberOfQuestions += 1;
                const updatedSurvey = {
                    surveyName: dbSurvey.dataValues.surveyName,
                    getId: dbSurvey.dataValues.getId,
                    numberOfRespondents: dbSurvey.dataValues.numberOfRespondents,
                    numberOfQuestions: dbSurvey.dataValues.numberOfQuestions,
                    preSurveyInstructions: dbSurvey.dataValues.preSurveyInstructions,
                    postSurveyInstructions: dbSurvey.dataValues.postSurveyInstructions,
                    surveyNotes: dbSurvey.dataValues.surveyNotes
                }
                db.Survey.update(updatedSurvey, {
                    where: {
                        surveyId: dbSurvey.dataValues.surveyId
                    }
                }).then((dbSurvey) => {
                    //console.log(dbQuestion.dataValues);
                    var hbsObject = { 
                        SurveySurveyId: dbQuestion.dataValues.SurveySurveyId,
                        userId: req.session.passport.user,
                        name: req.session.globalUser.name,
                        initials: req.session.globalUser.initials,
                        emailAddress: req.session.globalUser.emailAddress,
                        phoneNumber: req.session.globalUser.phoneNumber,
                        profileImage: req.session.globalUser.profileImage
                    }
                    return res.render('question/new', hbsObject);
                });
            });        
        }).catch((err) => {
            //console.log(err);
            res.render('error', err);
        });
    }
});

//======Get All User Surveys With Questions==================
// router.get('/mysurveys', function(req, res) {
//     where = (req.query.where && JSON.parse(req.query.where) || null);
//     db.Survey.findAll({
//         where: where,
//         order: req.query.order || [],
//         include: [{ model: db.Question, as: "Questions", attributes: ["questionId", "question", "questionInstruction", "optionType", "option1", "option2", "option3", "option4"] }]
//     }).then(function(surveys) {
//         res.json(surveys);
//     }).catch(function(err) {
//         res.render('error', err);
//     });
// });

//=================Get One User Survey With Questions==========
router.get('/mysurveys/:surveyId', function(req, res) {
    db.Survey.findOne({
        where: {
            surveyId: req.params.surveyId
        },
        include: [
            { model: db.Question, as: "Questions", attributes: ["questionId", "question", "questionInstruction", "optionType", "option1", "option2", "option3", "option4"] },
            { model: db.Response, as: "Responses", attributes: ["QuestionQuestionId", "RespondentRespondentId", "answer"] },
            { model: db.Respondent, as: "Respondents", attributes: ["respondentId", "respondentName", "respondentEmail", "respondentPhone"] }
        ]
    }).then(function(survey) {
        var hbsObject = survey.dataValues;
        hbsObject['initials'] = req.session.globalUser.initials;
        hbsObject['name'] = req.session.globalUser.name;
        hbsObject['emailAddress'] = req.session.globalUser.emailAddress;
        hbsObject['phoneNumber'] = req.session.globalUser.phoneNumber;
        hbsObject['profileImage'] = req.session.globalUser.profileImage;
        //console.log(survey.dataValues);
        res.render('survey/survey', hbsObject);
    }).catch(function(err) {
        res.render('error', err);
    });
});

//View Route For a Survey (Internal)
router.get('/viewSurvey/:surveyId', (req, res) => {
    db.Survey.findOne({
        where: {
            surveyId: req.params.surveyId
        },
        include: [{ model: db.Question, as: "Questions", attributes: ["questionId", "question", "questionInstruction", "optionType", "option1", "option2", "option3", "option4"] }]
    }).then(function(survey) {
        //console.log(survey.dataValues);
        var hbsObject = survey.dataValues;
        hbsObject['name'] = req.session.globalUser.name,
        hbsObject['initials'] = req.session.globalUser.initials,
        hbsObject['emailAddress'] = req.session.globalUser.emailAddress,
        hbsObject['phoneNumber'] = req.session.globalUser.phoneNumber,
        hbsObject['profileImage'] = req.session.globalUser.profileImage
        //console.log(hbsObject);
        res.render('survey/view', hbsObject);
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
        include: [{ model: db.Question, as: "Questions", attributes: ["questionId", "question", "questionInstruction", "optionType", "option1", "option2", "option3", "option4"] }]
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
    db.Respondent.create({
        respondentName: req.body.respondentName,
        respondentEmail: req.body.respondentEmail,
        respondentPhone: req.body.respondentPhone,
        SurveySurveyId: req.body.surveyId
    }).then((dbRespondent) => {
        var qandaArray = [];
        for (var i = 0; i < req.body.questionLength; i++) {
            var qanda = {
                QuestionQuestionId: req.body["questionId" + i],
                answer: req.body["answer" + i],
                RespondentRespondentId: dbRespondent.dataValues.respondentId,
                SurveySurveyId: req.body.surveyId
            }
            qandaArray.push(qanda);
        }

        //console.log(qandaArray);
        for (var i = 0; i < qandaArray.length; i++) {
            db.Response.create(qandaArray[i])
        }
        //Now increment Number of respondents
        db.Survey.findOne({
            where: {
                surveyId: req.body.surveyId
            }
        }).then((dbSurvey) => {
            dbSurvey.dataValues.numberOfRespondents += 1;
            const updatedSurvey = {
                surveyName: dbSurvey.dataValues.surveyName,
                getId: dbSurvey.dataValues.getId,
                numberOfRespondents: dbSurvey.dataValues.numberOfRespondents,
                preSurveyInstructions: dbSurvey.dataValues.preSurveyInstructions,
                postSurveyInstructions: dbSurvey.dataValues.postSurveyInstructions,
                surveyNotes: dbSurvey.dataValues.surveyNotes
            }
            var hbsObject = {
                respondentName: req.body.respondentName,
                respondentEmail: req.body.respondentEmail,
                respondentPhone: req.body.respondentPhone,
                surveyId: req.body.surveyId,
                qanda: qandaArray,
                surveyName: dbSurvey.dataValues.surveyName,
                getId: dbSurvey.dataValues.getId,
                numberOfRespondents: dbSurvey.dataValues.numberOfRespondents,
                preSurveyInstructions: dbSurvey.dataValues.preSurveyInstructions,
                postSurveyInstructions: dbSurvey.dataValues.postSurveyInstructions,
                surveyNotes: dbSurvey.dataValues.surveyNotes
            }

            db.Survey.update(updatedSurvey, {
                where: {
                    surveyId: dbSurvey.dataValues.surveyId
                }
            }).then((dbSurvey) => {
                //console.log(dbSurvey); //Returns Survey ID
                var hbsObject = { layout: false }
                return res.render('survey/complete', hbsObject);
            });
        });
    }).catch((err) => {
        res.render('error', err);
    });
});

router.get('/responses/:SurveySurveyId/view', (req, res) => {
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

//Get Route to Update Question
router.get('/profile', (req, res) => {
    db.User
        .findByPk(req.session.passport.user)
        .then((dbUser) => {
            var hbsObject = dbUser.dataValues;
            hbsObject['initials'] = hbsObject.name.split(" ")[0][0] + hbsObject.name.split(" ")[1][0];
            //console.log(hbsObject);
            res.render('user/profile', hbsObject);
        });
});

//Post Route to Update User Info
router.put('/user/update', (req,res) => {
    var updatedUserInfo = {
        name: req.body.name,
        emailAddress: req.body.emailAddress,
        phoneNumber: req.body.phoneNumber
    }
    //Validate User Info
    if (req.body.name == "") {
        updatedUserInfo['nameError'] = "Whats your name ?";
        return res.render('user/profile', updatedUserInfo);
    } else if (req.body.emailAddress == ""){
        updatedUserInfo["emailAddressError"] = "Uhm... Im going to need your email address."; 
        return res.render('user/profile', updatedUserInfo);
    } else if (req.body.phoneNumber == ""){
        updatedUserInfo['phoneNumberError'] = "What if I want to call you."; 
        return res.render('user/profile', updatedUserInfo);
    } else {
        db.User.update(updatedUserInfo, {
            where: {
                userId: req.session.passport.user
            }
        }).then((dbUser) => {
            res.redirect('/profile');
        }).catch((err) => {
            res.render('error', err);
        });
}
});


module.exports = router;