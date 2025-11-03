const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
    user: {
        type: String
    },
    album: {
        type: String
    },
    caption: {
        type: String
    },
    filename: {
        type: String
    },
    likes: {
        type: [String]
    },
    date_made: {
        type: Date,
        default: Date.now()
    }
});

const Photo = mongoose.model('Photo', PhotoSchema);

module.exports = Photo;