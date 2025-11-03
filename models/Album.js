const mongoose = require('mongoose');

const AlbumSchema = new mongoose.Schema({
    name: {
        type: String
    },
    user: {
        type: String
    },
    photos: {
        type: [String]
    },
    albumCover: {
        type: String
    },
    date_made: {
        type: Date,
        default: Date.now()
    }
});

const Album = mongoose.model('Album', AlbumSchema);

module.exports = Album;