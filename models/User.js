const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    username: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    gender: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    country: {
        type: String
    },
    birthday: {
        type: Date
    },
    joindate: {
        type: Date,
        default: Date.now
    },
    avatar: {
        type: String
    },
    coverPic: {
        type: String
    },
    bio: {
        type: String
    },
    following: {
        type: [String]
    },
    followers: {
        type: [String]
    },
    verified: {
        type: Boolean,
        default: false
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;