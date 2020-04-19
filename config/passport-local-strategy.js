const passport=require('passport');
const captcha=require('../config/captcha');

const LocalStrategy= require('passport-local').Strategy;

const User=require('../models/user');
//auth using passport
passport.use(new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true, //so that we can use req here
    }, async (req, email, password, done)=>{

        //find user and establish identity
        let user= await User.findOne({email: email});
        
        if (!user) {
            req.flash(
                'error',
                'Account Not Found! Please Create an Account'
            );
            return done(null, false, { message: 'That email is not registered' });
        }
            
        //check if the user is verified
        if(user.isVerified==false){
            req.flash(
                'error',
                'Please Verify your Email before loggin in'
            );
            return done(null, false, { message: 'Please Verify your Email before loggin in' });
        }

        //new match password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            req.flash(
                'error',
                'Invalid UserName or Password'
            );
            return done(null, false, { message: 'Password incorrect' });
        }
        // Old Match password code
        // bcrypt.compare(password, user.password, (err, isMatch) => {
        //     if (err) throw err;
        //     if (isMatch) {
        //         return done(null, user);
        //     } else {
        //         req.flash(
        //             'error',
        //             'Invalid UserName or Password'
        //         );
        //         return done(null, false, { message: 'Password incorrect' });
        //     }
        // });


        //new captcha check using middleware
        if(!await captcha.isCaptchaVerified(req)){
            return done(null, false, { message: 'Captcha problem' });
            
        }


        //captcha ckeck (old)
        // if(
        //     req.body['g-recaptcha-response'] === undefined || 
        //     req.body['g-recaptcha-response'] === '' || 
        //     req.body['g-recaptcha-response'] === null
        // ){
        //     req.flash(
        //         'error',
        //         'Invalid Captcha!'
        //     );
        //     return done(null, false, { message: 'Invalid Captcha!' });
        // }
    
        // const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + process.env.CAPTCHA_SECRET_KEY + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
        
        // await request(verificationURL,function(error,response,body) {
        //     body = JSON.parse(body);
        
        //     if(body.success !== undefined && !body.success) {
        //         req.flash(
        //             'error',
        //             'Captcha Verifiction Failed!'
        //         );
        //         return done(null, false, { message: 'Captcha Verifiction Failed!' });
        //     }
        // });
        
        return done(null, user);
    }
));

// serializing the user to decide which key is to be kept in the cookie
passport.serializeUser(function(user, done){
    done(null, user.id);
});

//deserialize the user from the key in the cookie
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        if(err)
        {
            console.log("Error in ==> Passport",err);
            return done(err);
        }
        return done(null, user);
    });
});

//check if the user is authenticated
passport.checkAuthentication=function(req, res, next){
    //if the user signed in then pass the rqst to next function(controller's action)
    if(req.isAuthenticated()){
        return next();
    }

    //if the user is not signed in
    return res.redirect('/users/sign-in');
}

passport.setAuthenticatedUser=function(req, res, next){
    if(req.isAuthenticated()){
        //req.user contains the current signed in user from the session cookie
        //and we want to send this to locals for the views.
        res.locals.user=req.user;
    }
    next();
}

module.exports=passport;