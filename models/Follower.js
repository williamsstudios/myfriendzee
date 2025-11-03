const mongoose = require('mongoose');

const FollowerSchema = new mongoose.Schema({
    user: {
        type: String
    },
    followedBy: {
        type: String
    },
    date_made: {
        type: Date,
        default: Date.now()
    }
});

const Follower = mongoose.model('Follower', FollowerSchema);

module.exports = Follower;