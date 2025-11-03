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

// Albums Page
router.get('/:id', ensureAuthenticated, (req, res) => {
    User.findOne({ username: req.params.id }, (err, user) => {
        if(err) {
            console.log(err);
        } else {
            Album.find({ user: req.params.id }, (err, albums) => {
                if(err) {
                    console.log(err);
                } else {
                    res.render('albums', {
                        title: user.firstname + "'s Photo Albums",
                        logUser: req.user,
                        user: user,
                        albums: albums
                    });
                }
            });
        }
    });
    
});

// Album Photos Page
router.get('/:id', ensureAuthenticated, (req, res) => {
    Album.findOne({ _id: req.params.id }, (err, album) => {
        if(err) {
            console.log(err);
        } else {
            Photo.aggregate([
                { $match: { album: req.params.id } },
                {
                    $lookup: {
                        from: "users",
                        localField: "user",
                        foreignField: "username",
                        as: "photos"
                    }
                },
                {
                    $unwind: "$photos"
                }
            ]).then(photos => {
                res.render('photos', {
                    title: album.name + ' Photos',
                    logUser: req.user,
                    album: album,
                    photos: photos
                });
            }).catch(err => console.log(err));
        }
    });
});

// Add An Album Function
router.post('/new/album', upload.array('photos', 10), (req, res) => {
    const name = req.body.name;
    const files = req.files;
    const caption = req.body.caption;

    if(!name) {
        req.flash(
            'error_msg',
            'Please enter an album name'
        );
        res.redirect(req.get('referer'));
    } else {
        let newAlbum = new Album({
            name: name,
            user: req.user.username
        });

        newAlbum
            .save()
            .then(newAlbum => {
                if(files.length > 0) {
                    files.forEach(file => {
                        let newPhoto = new Photo({
                            user: req.user.username,
                            album: newAlbum._id,
                            filename: file.filename,
                            caption: caption
                        });

                        newPhoto
                            .save()
                            .then(files => {
                                Album.findOneAndUpdate({ $and: [{ user: req.user.username }, { name: newAlbum.name }] }, { $push: { photos: file.filename }}, (err) => {
                                    if(err) {
                                        console.log(err);
                                    } else {
                                        req.flash(
                                            'success_msg',
                                            'Photo Album Created'
                                        );
                                        res.redirect(req.get('referer'));
                                    }
                                });
                            }).catch(err => console.log(err));
                    });
                }
            })
            .catch(err => console.log(err));
    }
});

// Add Photos To Album
router.post('/add/:id', upload.array('photos', 10), (req, res) => {
    const album = req.body.album;
    const files = req.files;
    const caption = req.body.caption;

    if(!files) {
        req.flash(
            'error_msg',
            'Please select atlease 1 photo'
        );
        res.redirect(req.get('referer'));
    } else {
        files.forEach(file => {
            let newPhoto = new Photo({
                user: req.user.username,
                album: album,
                caption: caption,
                filename: file.filename
            });

            newPhoto
                .save()
                .then(newPhoto => {
                    Album.findOneAndUpdate({ _id: req.params.id }, { $push: { photos: newPhoto.filename } }).exec();
                    req.flash(
                        'success_msg',
                        'Your Photos Have Be Uploaded'
                    );
                    res.redirect(req.get('referer'));
                })
                .catch(err => console.log(err));
        });
    }
});

// Comment On Photo Function
router.post('/comment/:id', (req, res) => {
    const data = req.body.commentText;

    if(!data) {
        req.flash(
            'error_msg',
            'Please type something first'
        );
        res.redirect(req.get('referer'));
    } else {
        let newComment = new Comment({
            user: req.user.username,
            post_id: req.params.id,
            data: data
        });

        newComment
            .save()
            .then(newComment => {
                res.redirect(req.get('referer'));
            })
            .catch(err => console.log(err));
    }
})

// View Photo
router.get('/view/:id', ensureAuthenticated, (req, res) => {
    Photo.findOne({ _id: req.params.id }, (err, photo) => {
        if(err) {
            console.log(err);
        } else {
            User.findOne({ username: photo.user }, (err, photoUser) => {
                if(err) {
                    console.log(err);
                } else {
                    Comment.aggregate([
                        { $match: { post_id: req.params.id } },
                        {
                            $lookup: {
                                from: "users",
                                localField: "user",
                                foreignField: "username",
                                as: "comments"
                            }
                        },
                        {
                            $unwind: "$comments"
                        }
                    ]).then(comments => {
                        res.render('view_photo', {
                            title: 'View Image',
                            logUser: req.user,
                            photo: photo,
                            photoUser: photoUser,
                            comments: comments
                        });
                    }).catch(err => console.log(err));
                }
            });
        }
    });
});

// Like Photo Function
router.post('/like/:id', (req, res) => {
    Photo.findOneAndUpdate({ _id: req.params.id }, { $push: { likes: req.user.username } }).exec();
})

// Unlike Photo Function
router.post('/unlike/:id', (req, res) => {
    Photo.findOneAndUpdate({ _id: req.params.id }, { $pull: { likes: req.user.username } }).exec();
})

module.exports = router;