require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const flash = require('connect-flash')

const connectDB = require("./config/db");

// Init app 
const app = express();
connectDB();

// View Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

// Static Folder
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
     secret: process.env.SESSION_SECRET || "development-secret",
     resave: false,
     saveUninitialized: false,
     store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
     cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.info_msg = req.flash('info_msg');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user || null;
    next();
});

// Routes
app.use("/", require("./routes/index.js"));
app.use("/auth", require("./routes/auth.js"));
app.use("/users", require("./routes/users.js"));

app.use((req, res) => res.status(404).send("Page not found"));

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
     console.log(`myfriendzee started on port ${PORT}`);
});