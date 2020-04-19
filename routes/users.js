const expess=require('express');
const router=expess.Router();
const passport=require('passport');

const usersController=require('../controllers/user_controller');

router.get('/dashboard', passport.checkAuthentication ,usersController.dashboard);

router.get('/sign-up', usersController.signUp);
router.get('/sign-in', usersController.signIn);
router.get('/forgot-password', usersController.forgotPassword);
router.get('/verify-email/:token', usersController.verifyEmail);

router.post('/create',usersController.create);

//use passport as a middleware to auth
router.post('/create-session',passport.authenticate('local', {
    failureRedirect: '/users/sign-in'
}), usersController.createSession);

router.get('/sign-out', usersController.destroySession);

router.post('/forgot-password-send-email', usersController.ForgotPasswordSendEmail);

router.get('/reset/:token', usersController.ViewResetForm);
router.post('/reset/:token', usersController.ResetUsingToken);

module.exports=router;