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
const Video = require('../models/Video');

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

// Video Gallery Page
router.get('/:id', ensureAuthenticated, (req, res) => {
    User.findOne({ username: req.params.id }, (err, user) => {
        if(err) {
            console.log(err);
        } else {
            Video.find({ user: user.username }, (err, videos) => {
                if(err) {
                    console.log(err);
                } else {
                    res.render('videos', {
                        title: user.firstname + "'s Videos",
                        logUser: req.user,
                        user: user,
                        videos: videos
                    });
                }
            });
        }
    })
});

// Watch Page
router.get('/watch/:id', ensureAuthenticated, (req, res) => {
    Video.findOne({ _id: req.params.id }, (err, video) => {
        if(err) {
            console.log(err);
        } else {
            User.findOne({ username: video.user }, (err, vidUser) => {
                if(err) {
                    console.log(err);
                } else {
                    Video.findOneAndUpdate({ _id: req.params.id }, { $push: { views: req.user.username } }).exec();

                    res.render('watch', {
                        title: video.title,
                        logUser: req.user,
                        vidUser: vidUser,
                        video: video
                    });
                }
            });
        }
    });
});

// Video Upload Function
router.post('/upload', upload.single('video'), (req, res) => {
    const title = req.body.title;
    const file = req.file;
    const description = req.body.description;
    const category = req.body.cateogry;
    const kids = req.body.kids

    if(!title || !kids) {
        req.flash(
            'error_msg',
            'The title and the suitable for kids fields can not be empty'
        );
        res.redirect(req.get('referer'));
    } else {
        let newVideo = new Video({
            title: title,
            user: req.user.username,
            filename: file.filename,
            description: description,
            category: category,
            kids: kids
        });

        newVideo
            .save()
            .then(video => {
                req.flash(
                    'success_msg',
                    'Your video was upload successfuly'
                );
                res.redirect(req.get('referer'));
            })
            .catch(err => console.log(err));
    }
})

// Like Video Function

// Unlike Video Function

module.exports = router;