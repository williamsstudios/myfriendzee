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
const Comment = require('../models/Comment');
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


// New text Post function
router.post('/new/:id', (req, res) => {
    const postText = req.body.postText;

    if(!postText) {
        req.flash(
            'error_msg',
            'Please type something first'
        );
        res.redirect(req.get('referer'));
    } else {
        req.user.followers.forEach(follower => {
            let newPost = new Post({
                author: req.user.username,
                account_name: follower,
                data: postText,
            });

            newPost
                .save()
                .then(newPost => {
                    res.redirect(req.get('referer'));
                })
                .catch(err => console.log(err));
        });
    }
});

// New Media Post Function
router.post('/new/media/:id', upload.single('media'), (req, res) => {
    const postText = req.body.postText;
    const file = req.file;

    if(!file) {
        req.flash(
            'error_msg',
            'Please select a photo or video file'
        );
        res.redirect(req.get('referer'));
    } else if(file.filename.endsWith('.jpg') || file.filename.endsWith('.png') || file.filename.endsWith('.gif')) {
        req.user.followers.forEach(follower => {
            let newPost = new Post({
                author: req.user.username,
                account_name: follower,
                data: postText,
                image: file.filename
            });

            newPost
                .save()
                .then(newPost => {
                    res.redirect(req.get('referer'));
                })
                .catch(err => console.log(err));
        });
    } else if(file.filename.endsWith('.mp4') || file.filename.endsWith('.avi')) {
        req.user.followers.forEach(follower => {
            let newPost = new Post({
                author: req.user.username,
                account_name: follower,
                data: postText,
                video: file.filename
            });

            newPost
                .save()
                .then(newPost => {
                    res.redirect(req.get('referer'));
                })
                .catch(err => console.log(err));
        });
    }
});

// Like Post Function
router.post('/like/:id', (req, res) => {
    Post.findOneAndUpdate({ _id: req.params.id }, { $push: { likes: req.user.username } }).exec();
});

// Unlike Post Function
router.post('/unlike/:id', (req, res) => {
    Post.findOneAndUpdate({ _id: req.params.id }, { $pull: { likes: req.user.username } }).exec();
});

// View Post Page
router.get('/view/:id', ensureAuthenticated, (req, res) => {
    Post.findOne({ _id: req.params.id }, (err, post) => {
        if(err) {
            console.log(err);
        } else {
            User.findOne({ username: post.author }, (err, postUser) => {
                if(err) {
                    console.log(err);
                } else {
                    res.render('view_post', {
                        title: postUser.firstname + "'s Post",
                        logUser: req.user,
                        post: post,
                        postUser: postUser
                    });
                }
            });
        }
    });
});

module.exports = router;