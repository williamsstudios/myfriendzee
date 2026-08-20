const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const fs = require('fs');
const User = require("../models/User");
const { isGuest } = require("../middleware/auth");

// Sign Up Page
router.get("/signup", isGuest, async (req, res) => {
     res.render("signup", { 
          title: "Create Account", 
          theme: "" 
     })
});

// Fan Sign Up Function
router.post('/signup/fan', isGuest, async (req, res) => {
     const { firstname, lastname, username, email, pass, pass2, gender, country, birthday } = req.body;
     let errors = [];

     if(!firstname || !lastname || !username || !email || !pass || !pass2 || !gender || !country || !birthday) {
          errors.push({ msg: "All fields required" });
     } 
     if(pass != pass2) {
          errors.push({ msg: "Your password fields do not match" });
     }
     if(pass.length < 8) {
          errors.push({ msg: "Passwords should be 8 or more characters" });
     }
     if(errors.length > 0) {
          res.render('signup', {
               title: "Signup",
               errors: errors
          });
     } else {
          const isUser = User.findOne({ $or: [{ username: username }, { email: email }] });
          if(isUser) {
               errors.push({ msg: "There is already an account with that username or email" });
               res.render('signup', {
                    title: "Sign Up",
                    errors: errors
               });
          } else {
               let newUser = new User({
                    firstname: firstname,
                    lastname: lastname,
                    username: username,
                    email: email,
                    password: pass,
                    gender: gender,
                    country: country,
                    birthday: birthday,
                    accountType: "fan"
               });

               bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => {
                                fs.mkdir("./public/uploads/" + newUser.username, function(err) {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        newUser
                                            .save()
                                            .then(newUser => {
                                                  fs.mkdir("./public/uploads/" + newUser.username, function(err) {
                                                       if (err) {
                                                            console.log(err)
                                                       } else {
                                                            newUser
                                                                 .save()
                                                                 .then(newUser => {
                                                                      req.flash(
                                                                           'success_msg',
                                                                           'Account Created You May Now Login'
                                                                      );
                                                                      res.redirect(req.get('referer'));
                                                                 })
                                                                 .catch(err => console.log(err));
                                                       }
                                                  });
                                            })
                                            .catch(err => console.log(err));
                                    }
                                });
                            })
                            .catch(err => console.log(err));
                    });
               });
          }
     }
});

// Aritst Sign Up Function
router.post('/signup/artist', isGuest, async (req, res) => {
     const { firstname, lastname, artistName, username, email, pass, pass2, gender, country, genre, birthday} = req.body;
     let errors = [];

     if(!firstname || !lastname || !artistName || !email || !username || !pass || !pass2 || !gender || !country || !birthday || !genre) {
          errors.push({ msg: "All Fields Required" });
     }
     if(pass != pass2) {
          errors.push({ msg: "Your Password Fields Do Not Match" });
     }
     if(pass.length < 8) {
          errors.push({ msg: "Passwords Should Be 8 Or More Characters" });
     }
     if(errors.length > 0) {
          res.render('signup', {
               title: "Create Account",
               theme: "",
               errors: errors
          });
     } else {
          const isUser = User.findOne({ $or: [{ username: username }, { email: email }] });
          if(isUser.length > 0) {
               errors.push({ msg: "There's Already An Account With That Username Or Email" });
               res.render('signup', {
                    title: "Create Account",
                    theme: "",
                    errors: errors
               });
          } else {
               let newUser = new User({
                    firstname: firstname,
                    lastname: lastname,
                    username: username,
                    artistName: artistName,
                    email: email,
                    password: pass,
                    gender: gender,
                    genre: genre,
                    country: country,
                    birthday: birthday,
                    accountType: "artist"
               });

               bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => {
                                fs.mkdir("./public/uploads/" + newUser.username, function(err) {
                                    if (err) {
                                        console.log(err)
                                    } else {
                                        newUser
                                            .save()
                                            .then(newUser => {
                                                  fs.mkdir("./public/uploads/" + newUser.username, function(err) {
                                                       if (err) {
                                                            console.log(err)
                                                       } else {
                                                            newUser
                                                                 .save()
                                                                 .then(newUser => {
                                                                      req.flash(
                                                                           'success_msg',
                                                                           'Account Created You May Now Login'
                                                                      );
                                                                      res.redirect(req.get('referer'));
                                                                 })
                                                                 .catch(err => console.log(err));
                                                       }
                                                  });
                                            })
                                            .catch(err => console.log(err));
                                    }
                                });
                            })
                            .catch(err => console.log(err));
                    });
               });
          }
     }
});

router.get("/login", isGuest, (req, res) => res.render("login", { title: "Login", theme: "" }));

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
});


router.get("/logout", async (req, res, next) => {
  try {
    if (req.user) await User.findByIdAndUpdate(req.user._id, { online: false });
    req.logout(err => {
      if (err) return next(err);
      res.redirect("/");
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;