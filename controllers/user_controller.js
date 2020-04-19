const crypto = require("crypto");//for creating token

const User=require('../models/user');
const nodemailer=require('../config/nodemailer');
const captcha=require('../config/captcha');

module.exports.signUp=(req, res)=>{
    if(req.isAuthenticated()){
        return res.redirect('/users/dashboard');
    }
    return res.render('user_sign_up', {
        title: "User Auth | Sign Up",
        user: req.user
    });
};

module.exports.signIn=async (req, res)=>{
    if(req.isAuthenticated()){
        return res.redirect('/users/dashboard');
    }
    // console.log(req);
    return res.render('user_sign_in', {
        title: "User Auth | Sign In",
        user: req.user,
    });
};

//get the sign up data
module.exports.create= async (req, res)=>{

    try {
        //password dosen't match the confirm password.
        if(req.body.password != req.body.confirm_password){
            req.flash(
                'error',
                'Passwords Didn\'t Match.'
            );
            return res.redirect('/users/sign-up');
        }

        //password length less than 6
        if(req.body.password.length<6){
            req.flash(
                'error',
                'Passwords should not be less than 6 characters.'
            );
            return res.redirect('/users/sign-up');
        }
        if(!await captcha.isCaptchaVerified(req)){
            
            return res.redirect('/users/sign-up');
        }
        
        let user=await User.findOne({email: req.body.email});
        
        //cheack if user already present or not
        if(!user){
            //generating token
            var buf=await crypto.randomBytes(20);
            var token = buf.toString('hex');

            //creating new user
            await User.create({
                name:req.body.name,
                email:req.body.email,
                password:req.body.password,
                verificationToken:token
            });

            //sending email for verification
            var mailOptions = {
                to: req.body.email,
                subject: 'User Auth | Email Verification',
                text: 'Hi '+req.body.name+', \n\n You account is Created Sucessfully.\n\n' +
                'Please click on the following link, or paste this into your browser to complete email verification:\n\n' +
                'http://' + req.headers.host + '/users/verify-email/' + token + '\n\n' +
                'Please Note that if you dont verify your account, You wont be able to log in.'
            };
            //send eamil for reset password.
            let mail=await nodemailer.transporter.sendMail(mailOptions);
            if(!mail){
                req.flash('error', 'Error Sending Mail!');
            }
            //console.log('mail sent');
            req.flash('success', 'You are now registered. An e-mail has been sent to ' + req.body.email + ' with further instructions.');
            return res.redirect('/users/sign-in');
        }
        else{ 
            // return res.redirect('back');
            req.flash(
                'error',
                'User Already Exists!'
            );
            return res.redirect('/users/sign-up');
        }
        
    } catch (error) {
        console.log("Error",error);
        req.flash(
            'error',
            'Some Error Occoured!'
        );
        return res.redirect('/users/sign-up');
    }
}

//sign in and create a session for user
module.exports.createSession=async (req, res)=>{
    //req.flash('success', 'Logged In Sucessfully!');
    
    return res.render('user_dashboard', {
        title: "User Auth | Dashboard",
        user: req.user,
    });
};

module.exports.destroySession=function(req, res){
    req.flash('success', 'Sucessfully Logged Out!');
    req.logout();
    return res.redirect('/users/sign-in');
}

module.exports.dashboard=(req, res)=>{
    //console.log(req.user);

    return res.render('user_dashboard', {
        title: "User Auth | User dashboard",
        user: req.user
    });
    
};

module.exports.forgotPassword=(req, res)=>{
    if(req.isAuthenticated()){
        return res.redirect('/users/dashboard');
    }
    return res.render('user_forgot_password',{
        title: "User Auth | Forgot Password",
        user: req.user
    })
}

module.exports.ForgotPasswordSendEmail=async (req,res,next)=> {

    if(req.isAuthenticated()){
        return res.redirect('/users/dashboard');
    }

    var buf=await crypto.randomBytes(20);
    var token = buf.toString('hex');
          
    var user=await User.findOne({ email: req.body.email });
    //check if user is veried
    if(user.isVerified==false){
        req.flash(
            'error',
            'Your Email Verification is Pending. You need to Verify your Email first.'
        );
        return res.redirect('/users/forgot-password');
    }

    //check if user with that email present or not
    if (!user) {
        req.flash('error', 'No account with that email address exists.');
        return res.redirect('/users/forgot-password');
    }
  
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    user.save();

    var mailOptions = {
        to: user.email,
        subject: 'User Auth | Password Reset Email',
        text: 'Hi, \n\n You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n\nThank You\nUser Auth Team.'
    };
    //send eamil for reset password.
    let mail=await nodemailer.transporter.sendMail(mailOptions);
    if(!mail){
        req.flash('error', 'Error Sending Mail!');
    }
    //console.log('mail sent');
    req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
    return res.redirect('/users/forgot-password');
};


module.exports.ViewResetForm=(req, res)=>{
    if(req.isAuthenticated()){
        return res.redirect('/users/dashboard');
    }
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('/users/forgot-password');
        }
        res.render('user_password_reset', {
            user: req.user,
            title: "User Auth| Reset Password",
            token: req.params.token,
        });
    });
}

module.exports.ResetUsingToken=async(req, res)=>{

    try {
        
        if(req.isAuthenticated()){
            return res.redirect('/users/dashboard');
        }
    
        let user=await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
        }
        if(req.body.password === req.body.confirm_password) {
    
            user.password=req.body.password;
            user.save();
            req.flash('success', 'Password Changed Successfully!.');
            res.redirect('/users/sign-in');
    
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }

    } catch (error) {
        console.log(error);
        req.flash("error", "Some Error Occoured!");
        res.redirect('/users/forgot-password');
    }
}

module.exports.verifyEmail=async (req, res)=>{

    try {
        
        let user=await User.findOne({verificationToken:req.params.token});
        if(!user){
            req.flash(
                'error',
                'Wrong Token Cannot Verify User!'
            );
            return res.redirect('/users/sign-in');
        }
        if(user.isVerified){
            req.flash(
                'error',
                'User Already Verified!'
            );
            return res.redirect('/users/sign-in');
        }
        await user.updateOne({isVerified:true});
        //user.save();
        req.flash(
            'success',
            'User Verification Sucessfull!'
        );
        return res.redirect('/users/sign-in');

    } catch (error) {
        console.log(error);
        req.flash(
            'error',
            'Something Went Wrong!'
        );
        return res.redirect('/users/sign-in');
    }

}