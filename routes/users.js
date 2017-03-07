/* eslint-env node */
var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

var User = require('../models/user');

/* GET request routing: home page. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
/* GET request routing: registration page. */
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});
/* GET request routing: login page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});
/* POST request routing: respond login page. */
router.post('/login',
  passport.authenticate('local',{failureRedirect:'/users/login', failureFlash:'We\'re sorry, but the user name and/or password you attempted is invalid.'}),
  function(req, res) {
    req.flash('success','You are now logged in, proceed at your own caution.');
    res.redirect('/');
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done){
    User.getUserByUsername(username, function(err, user){
        if(err) throw err;
        if(!user) {
            return done(null, false, {message: 'User not found in database.'})
        }
    });
    User.comparePassword(password, user.password, function(err, isMatch){
        if(err) return done(err);
        if(isMatch){
            return done(null, user);
        } else {
            return done(null, false, {message: 'Invalid Password.'});
        }
    });
}));

/* POST to handle user registration info, including pic, w/ multer & upload */
router.post('/register', upload.single('profileImg'), function(req, res, next) {
  // console.log(req.body.name);
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;
  console.log(req.file);

  if(req.file){
    console.log('Uploading Image File...\n');
    console.log(req.file);
    var profileImg = req.file.originalname;
  } else {
    console.log('No File Uploaded...');
    var profileImg = 'no-image.jpg';
  }

  // Form Validator
  req.checkBody('name','Name field is required').notEmpty();
  req.checkBody('email','Email field is required').notEmpty();
  req.checkBody('email','Email is not valide').isEmail();
  req.checkBody('username','User Name field is required').notEmpty();
  req.checkBody('password','Password field is required').notEmpty();
  req.checkBody('password2','Both Passwords entered do not match').equals(req.body.password);

  // Check for Errors
  var mistakesWereMade = req.validationErrors();

  if(mistakesWereMade) {
    console.log("Let's face it: Mistakes were made.");
    res.render('register', {
      errors: mistakesWereMade
    });
  } else {
    console.log("No mistakes made — perfect!");
    var newUser = new User({
        name: name,
        email: email,
        username: username,
        password: password,
        profileImg: profileImg
    });
    
    User.createUser(newUser, function(err, user) {
        if(err) {
            throw err;
            console.log('Could not create user in Database, Mistakes were made: ' + err);
        } else {
            console.log("User creatd in Database: " + user.username);   
        }
    });
    
    req.flash('success', 'Congrats, you are now registered — please Login through the Login link above 👆🏽.');
    
    res.location('/');
    res.redirect('/');
  }
});

module.exports = router;