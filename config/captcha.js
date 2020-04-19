const request = require('request');

module.exports.isCaptchaVerified=async(req)=>{
    if(
        req.body['g-recaptcha-response'] === undefined || 
        req.body['g-recaptcha-response'] === '' || 
        req.body['g-recaptcha-response'] === null
    ){
        req.flash(
            'error',
            'Invalid Captcha!'
        );
        return false;
    }

    const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + process.env.CAPTCHA_SECRET_KEY + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    
    await request(verificationURL,function(error,response,body) {
        body = JSON.parse(body);
    
        if(body.success !== undefined && !body.success) {
            req.flash(
                'error',
                'Captcha Verifiction Failed!'
            );
            return false;
        }
    });
    return true;
}