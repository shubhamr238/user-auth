const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports.transporter=nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    post: 587,
    //secure: false,
    auth: {
        user: process.env.gmailId ,
        pass: process.env.gmailPass
    },
});