const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const { forwardAuthenticated, ensureAuthenticated } = require('./config/auth');

// Init App
const app = express();

// Views Folder And View Engine
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');

// Public Folder
app.use(express.static(path.join(__dirname, "public")));

// Favicon
app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'favicon.ico')));

// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
    .connect(
        db,
        { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Express Body Parser
app.use(express.urlencoded({ extended: true }));

// Express Session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);

// Passport Middleware 
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.info_msg = req.flash('info_msg');
    res.locals.error = req.flash('error');
    next();
});

// Home Route
app.get('/', forwardAuthenticated, (req, res) => {
    res.render('index', {
        title: 'myFriendzee',
        logUser: ""
    });
});

// Routes
app.use('/users', require('./routes/users'));
app.use('/followers', require('./routes/followers'));
app.use('/photos', require('./routes/photos'));
app.use('/posts', require('./routes/posts'));

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Server Listening...');
});