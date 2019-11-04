/* eslint-disable max-len */
// const session = require('express-session');
// load bcrypt
const bCrypt = require('bcrypt-nodejs');
const db = require('../../models');
const nodemailer = require('nodemailer');
const transporter = require('../email/email');

module.exports = function(passport, user) {
  const User = user;
  const LocalStrategy = require('passport-local').Strategy;

  // creates a cookie for the user sessions
  passport.serializeUser(function(user, done) {
    done(null, user.userId);
  });

  // used to deserialize the user
  // reads the cookie
  passport.deserializeUser(function(userId, done) {
    User.findByPk(userId).then(function(user) {
      if (user) {
        done(null, user.get());
      } else {
        done(user.errors, null);
      }
    });
  });

  // passport.serializeUser(function(user, done) {
  //   done(null, user);
  // });

  // passport.deserializeUser(function(user, done) {
  //   done(null, user);
  // });

  passport.use('local-signup', new LocalStrategy({
    usernameField: 'emailAddress',
    passwordField: 'password',
    passReqToCallback: true, // allows us to pass back the entire request to the callback
  },

  function(req, email, password, done) {
    const generateHash = function(password) {
      return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
    };

    User.findOne({
      where: {
        emailAddress: email,
      },
    }).then(function(user) {
      if (user) {
        return done(null, false, {
          message: 'That email is already taken',
        });
      } else {
        const userPassword = generateHash(password);
        const data = {
          emailAddress: email,
          password: userPassword,
          name: req.body.name,
          phoneNumber: req.body.phoneNumber,
          profileImage: req.file.filename,
        };

        User.create(data).then(function(newUser, created) {
          if (!newUser) { return done(null, false); }
          if (newUser) { return done(null, newUser);}
        }).then(()=>{
        db.Contact.findOne({
          where: { email: email, },
        }).then((dbContact) => {
          if (dbContact == null) {
            db.Contact.create({
              firstName: req.body.name.split(' ')[0],
              lastName: req.body.name.split(' ')[1],
              email: email,
          }).then(()=>{

          const emailBody = `
          <span style="text-transform: uppercase; font-size: 1rem;color: black;"><strong>Surveneer</strong></span>
          <p>Hello ${req.body.name.split(' ')[0]},</p>
          <p style="color: black;">Your account is set annd you're all good to go. Click <a href="https://surveneer.herokuapp.com/">here</a> to sign in to create your first survey.</p>
          <p> The SurvEnEEr Team</p>
          `;

          let mailOptions = {
            from: '"SurvEnEEr" <ttejuosho@aol.com>', // sender address
            to: email, // list of receivers
            subject: 'New account created', // Subject line
            text: 'Hello world?', // plain text body
            html: emailBody, // html body
            //template: 'templates/surveynotification'
        };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              resolve(false);
              const hbsObject = {
                  error: 'An error occurred while sending a welcome email',
              };
              res.render('error', hbsObject);
          } else {
            resolve(true);
            console.log('Message ID: %s', info.messageId); 
          }
          });

          }).catch((err) => {
              return res.render('error', err);
          });
          }
        });
      });
      }
    });
  }
  ));

  // LOCAL SIGNIN
  passport.use('local-signin', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'emailAddress',
    passwordField: 'password',
    passReqToCallback: true, // allows us to pass back the entire request to the callback
    failureFlash: true,
  },

  function(req, email, password, done) {
    const User = user;
    const isValidPassword = function(userpass, password) {
      return bCrypt.compareSync(password, userpass);
    };

    User.findOne({
      where: {
        emailAddress: email,
      },
    }).then(function(user) {
      if (!user) {
        return done(null, false, {
          message: 'Email does not exist',
        });
      }

      if (!isValidPassword(user.password, password)) {
        return done(null, false, {
          message: 'Incorrect password.',
        });
      }
      const userinfo = user.get();
      return done(null, userinfo);
    }).catch(function(err) {
      console.log('Error:', err);
      return done(null, false, {
        message: 'Something went wrong with your Signin',
      });
    });
  }
  ));
};
