const nodemailer = require('nodemailer');

const sendEmail = function(emailBody, subject, recipients) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.aol.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'ttejuosho@aol.com', // user
      pass: process.env.EMAIL_PASSWORD, // password
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // transporter.use('compile', eht({
  //     viewEngine: 'express-handlebars',
  //     viewPath: `${appRoot}/views`,
  // }));

  const mailOptions = {
    from: '"SurvEnEEr" <ttejuosho@aol.com>', // sender address
    to: recipients, // list of receivers
    subject: subject, // Subject line
    // text: 'Hello world?', // plain text body
    html: emailBody, // html body
    // template: 'templates/surveynotification'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      resolve(false);
    } else {
      resolve(true);
      console.log('Message ID: %s', info.messageId);
      console.log(info.envelope.to.toString());
    }
  });
};

module.exports = sendEmail;
