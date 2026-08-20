const express = require('express');
const router = express.Router();
const { isGuest, isAuthenticated } = require("../middleware/auth");

// Load Models
const User = require('../models/User');
const Alert = require('../models/Alert');

// Home page
router.get('/', isGuest, async (req, res) => {
     const users = await User.find().sort({ createdAt: -1 }).limit(8);
     res.render('index', {
          title: "Home",
          theme: "",
          users: users
     });
});

router.get('/dashboard', async(req, res) => {
     if (!req.isAuthenticated()) return res.redirect("/login");
     const alerts = Alert.find({ receivers: req.user.username });

     res.render('dashboard', {
          title: "Dashboard",
          theme: "",
          curUser: req.user,
          alerts: alerts
     })

});


module.exports = router;