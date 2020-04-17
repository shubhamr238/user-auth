const nodemailer = require('nodemailer');

module.exports.transporter=nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    post: 587,
    source: false,
    auth: {
        user: 'user@gmail.com',
        pass: 'password'
    }
});