const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: 'smtp.aol.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "ttejuosho@aol.com", // user
        pass: process.env.EMAIL_PASSWORD // password
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = transporter;