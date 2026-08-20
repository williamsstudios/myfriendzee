const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const fs = require('fs');
const path = require("path");
const multer = require('multer');
const { isGuest } = require("../middleware/auth");

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

// Load Models
const User = require("../models/User");
const Alert = require("../models/Alert");
const Gallery = require("../models/Gallery");
const MediaItem = require("../models/MediaItem");

// Profile Page
router.get("/profile/:id", async (req, res) => {
     try {
          const user = User.findOne({ username: req.params.id }).limit(1);

          if(user) {
               let tempTitle = "";

               if(user.accountType == "artist") {
                    tempTitle = user.artistName + "'s Profile";
               } else {
                    tempTitle = user.firstname + " " + user.lastname + "'s Profile ";
               }

               res.render('profile', {
                    title: tempTitle,
                    curUser: req.user,
                    user: user
               });
          } else {
               if (!user) return res.status(404).send("User not found");
          }
     } catch(error) {
          console.error(error);
          res.status(500).send("Server error");
     }
});

// Upload Media Function
router.post("/mediaUpload", upload.single("mediaItem"), (req, res) => {
     const file = req.file;
     const user = req.user.username;
     const caption = req.body.caption;
     const gallery = req.body.gallery;

     if(!gallery || !file) {
          req.flash('error_msg', 'Please select an image or make sure gallery is not empty');
          res.redirect(req.get('referer'));
     } else {
          let newGallery = new Gallery({
               user: user,
               name: gallery
          });

          newGallery
               .save()
               .then(newGallery => {
                    let newMeidaItem = new MediaItem({
                         user: user,
                         filename: file.filename,
                         caption: caption
                    });

                    newMeidaItem
                         .save()
                         .then(newMeidaItem => {
                              if(user.friends != "" || user.followers != "") {
                                   let newAlert = new Alert({
                                        user: req.user.username,
                                        receivers: user.friends || user.followers,
                                        app: "New Photo",
                                        note: "uploaded a new photo"
                                   });

                                   newAlert
                                        .save()
                                        .then(newAlert => {
                                             req.flash('success_msg', 'You uploaded a photo');
                                             res.redirect(req.get('referer'));
                                        })
                                        .catch(err => console.log(err));
                              } else {
                                   req.flash('success_msg', 'You uploaded a photo');
                                   res.redirect(req.get('referer'));
                              }
                         })
                         .catch(err => console.log(err));
               })
     }

});

module.exports = router;