const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const helpers = require('../helper/helpers');
const { forwardAuthenticated, ensureAuthenticated } = require('../config/auth');

// Load modals
const User = require('../models/User');
const Follower = require('../models/Follower');
const Album = require('../models/Album');
const Photo = require('../models/Photo');
const Post = require('../models/Post');

// Multer Config
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads/' + req.user.username)
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

var upload = multer({
    storage: storage
});


// Sign Up Page
router.get('/signup', forwardAuthenticated, (req, res) => {
    res.render('signup', {
        title: 'Sign Up',
        logUser: ''
    });
});

// Sign Up Function
router.post('/signup', (req, res) => {
    const { firstname, lastname, username, reg_email, pass, pass2, country, gender, birthday} = req.body;
    let errors = [];

    if(!firstname || !lastname || !username || !reg_email || !pass || !pass2 || !country || !gender || !birthday) {
        errors.push({ msg: 'First Name, Last Name, Username, Email, Password, Country, Gender, Birthday are all required to signup' });
    } 
    if(pass != pass2) {
        errors.push({ msg: 'Your Password Fields Do Not Match' });
    }
    if(pass.length < 7) {
        errors.push({ msg: 'Passwords Should Be 7 characters or longer' });
    }
    if(username.length < 3 || username.length > 32) {
        errors.push({ msg: 'Usernames should be between 3 and 32 characters' });
    }
    if(errors.length > 0) {
        res.render('signup', {
            title: 'Sign Up',
            logUser: '',
            errors: errors
        });
    } else {
        const age = helpers.calculateAge(birthday);
        if(age <= 13) {
            errors.push({ msg: 'You are not of age to sign up' });
            res.render('signup', {
                title: 'Sign Up',
                logUser: '',
                errors: errors
            });
        } else {
            let newUser = new User({
                firstname: firstname,
                lastname: lastname,
                username: username,
                email: reg_email,
                password: pass,
                gender: gender,
                country: country,
                birthday: birthday
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
                });
            });
        }
    }
});

// Log In Function
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/users/dashboard',
        failureRedirect: '/',
        failureFlash: true
    })(req, res, next);

});

// Log Out Function
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
});

// Search Page
router.get('/search', ensureAuthenticated, (req, res) => {
    res.render('search', {
        title: 'Search',
        logUser: req.user,
        results: ""
    });
});

// Search Function
router.post('/search', (req, res) => {
    const query = req.body.query;

    if(!query) {
        req.flash(
            'error_msg',
            'Please type something first'
        );
        res.redirect(req.get('referer'));
    } else {
        User.find({ username: { $regex: query, $options: "i" } }, (err, results) => {
            if(err) {
                console.log(err);
            } else {
                res.render('search', {
                    title: 'Search Results',
                    logUser: req.user,
                    results: results
                })
            }
        });
    }
});

// Dashboard Page
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    Post.aggregate([
        { $match: { $or: [{ author: req.user.username }, { account_name: req.user.username }] } },
        {
            $lookup: {
                from: "users",
                localField: "author",
                foreignField: "username",
                as: "posts"
            }
        },
        {
            $unwind: "$posts"
        }
    ]).then(posts => {
        User.find({ country: req.user.country }, (err, sugestions) => {
            if(err) {
                console.log(err);
            } else {
                res.render('dashboard', {
                    title: 'Dashboard',
                    logUser: req.user,
                    posts: posts,
                    sugestions: sugestions
                });
            }
        });
    }).catch(err => console.log(err));
    
});

// Profile Page
router.get('/:id', ensureAuthenticated, (req, res) => {
    User.findOne({ username: req.params.id }, (err, user) => {
        if(err) {
            console.log(err);
        } else {
            Follower.aggregate([
                { $match: { user: req.params.id } },
                {
                    $lookup: {
                        from: "users",
                        localField: "followedBy",
                        foreignField: "username",
                        as: "followers"
                    }
                },
                {
                    $unwind: "$followers"
                }
            ]).then(followers => {
                Post.aggregate([
                    { $match: { author: req.params.id } },
                    {
                        $lookup: {
                            from: "users",
                            localField: "author",
                            foreignField: "username",
                            as: "posts"
                        }
                    },
                    {
                        $unwind: "$posts"
                    }
                ]).then(posts => {
                    res.render('profile', {
                        title: user.firstname + ' ' + user.lastname,
                        logUser: req.user,
                        user: user,
                        followers: followers,
                        posts: posts
                    })
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        }
    });
});

// Edit Profile Picture Function
router.post('/edit/avatar', upload.single('avatar'), (req, res) => {
    const file = req.file;

    if(!file) {
        req.flash(
            'error_msg',
            'Please select an image'
        );
        res.redirect(req.get('referer'));
    } else {
        let updateAvatar = {
            avatar: file.filename
        };

        let query = { username: req.user.username };

        User.findOneAndUpdate(query, updateAvatar, (err) => {
            if(err) {
                console.log(err);
            } else {
                req.flash(
                    'success_msg',
                    'Profile Picture Updated'
                );
                res.redirect(req.get('referer'));
            }
        });
    }
});

// Edit Cover Picture Functionk
router.post('/edit/cover', upload.single('cover'), (req, res) => {
    const file = req.file;

    if(!file) {
        req.flash(
            'error_msg',
            'Please select an image'
        );
        res.redirect(req.get('referer'));
    } else {
        let updateCover = {
            coverPic: file.filename
        };

        let query = { username: req.user.username };

        User.findOneAndUpdate(query, updateCover, (err) => {
            if(err) {
                console.log(err);
            } else {
                req.flash(
                    'success_msg',
                    'Cover Picture Updated'
                );
                res.redirect(req.get('referer'));
            }
        });
    }
});

// Edit Name Function
router.post('/edit/name', (req, res) => {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;

    if(!firstname || !lastname) {
        req.flash(
            'errror_msg',
            'First and Last name can not be empty'
        );
        res.redirect(req.get('referer'));
    } else {
        let updateName = {
            firstname: firstname,
            lastname: lastname
        };

        let query = { username: req.user.username };

        User.findOneAndUpdate(query, updateName, (err) => {
            if(err) {
                console.log(err);
            } else {
                req.flash(
                    'success_msg',
                    'Name Updated'
                )
                res.redirect(req.get('referer'));
            }
        });
    }
});

// Edit Location Function
router.post('/edit/location', (req, res) => {
    const city = req.body.city;
    const state = req.body.state;
    const country = req.body.country;

    if(!country) {
        req.flash(
            'errror_msg',
            'Country field can not be empty'
        );
        res.redirect(req.get('referer'));
    } else {
        let updateLocation= {
            city: city,
            state: state,
            country: country
        };

        let query = { username: req.user.username };

        User.findOneAndUpdate(query, updateLocation, (err) => {
            if(err) {
                console.log(err);
            } else {
                req.flash(
                    'success_msg',
                    'Location Updated'
                )
                res.redirect(req.get('referer'));
            }
        });
    }
});

// Edit Bio Function
router.post('/edit/bio', (req, res) => {
    const bio = req.body.bio;

    if(!bio) {
        req.flash(
            'error_msg',
            'Please type something first'
        );
        res.redirect(req.get('referer'));
    } else {
        let updateBio = {
            bio: bio
        };

        let query = { username: req.user.username };

        User.findOneAndUpdate(query, updateBio, (err) => {
            if(err) {
                console.log(err);
            } else {
                req.flash(
                    'success_msg',
                    'About Me Updated'
                );
                res.redirect(req.get('referer'));
            }
        })
    }
});



module.exports = router;