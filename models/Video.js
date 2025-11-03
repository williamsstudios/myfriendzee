const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
    title: {
        type: String
    },
    user: {
        type: String
    },
    filename: {
        type: String
    },
    description: {
        type: String
    },
    views: {
        type: [String]
    },
    likes: {
        type: [String]
    },
    kids: {
        type: Boolean,
        default: false
    },
    category: {
        type: String
    },
    date_made: {
        type: Date,
        default: Date.now()
    }
});

const Video = mongoose.model('Video', VideoSchema);

module.exports = Video;