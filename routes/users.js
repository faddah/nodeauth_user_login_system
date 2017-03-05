 /* eslint-env node */
var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});

var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

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