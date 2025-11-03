const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Load Models
const User = require('../models/User');
const Follower = require('../models/Follower');

// Follow Function
router.post('/follow/:id', (req, res) => {
    User.findOneAndUpdate({ username: req.user.username }, { $push: { following: req.params.id } }).exec();
    User.findOneAndUpdate({ username: req.params.id }, { $push: { followers: req.user.username } }).exec();
    
    let newFollower = new Follower({
        user: req.params.id,
        followedBy: req.user.username
    });

    newFollower
        .save()
        .then(newFollower => {
            req.flash(
                'success_msg',
                'You Followed A User'
            );
            res.redirect(req.get('referer'));
        })
        .catch(err => console.log(err));
})



module.exports = router;