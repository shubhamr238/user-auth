const express = require("express");
const app = express();
const expressLayouts= require("express-ejs-layouts");
const session=require('express-session');//used for session cookie
const passport=require('passport');
const passportLocal= require('./config/passport-local-strategy');
const MongoStore=require('connect-mongo')(session);
const flash = require('connect-flash');
const coustomMware=require('./config/middleware');

const port = 8000;
const db = require("./config/mongoose");

//view engine
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static('./assets'));

//mongostore is used to store the session cookie in the db
app.use(session({
  name: 'User-Auth',
  //todo change secrect before deploy i.e production
  secret: 'blahsomething',
  saveUninitialized: false,
  resave: false,
  cookie:{
      maxAge:(1000*60*100)
  },
  store: new MongoStore({
      mongooseConnection: db, 
      autoRemove: 'disable'
  },function(err){
      console.log(err|| "connect-mongodb setup ok");
  })
}));
// Connect flash
app.use(flash());
app.use(coustomMware.setFlash);

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);

app.use(expressLayouts);

// body parser for req.body
app.use(express.urlencoded({extended: true}));


//extract style and script from sub pages into the layout
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

//use express router
app.use('/', require('./routes'));

//Server Listner
app.listen(port, function(err) {
  if (err) {
    console.log("Error Running the Server", err);
  }
  console.log("Server Running on Port: ", port);
});