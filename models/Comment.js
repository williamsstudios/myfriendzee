const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    user: {
        type: String
    },
    post_id: {
        type: String
    },
    data: {
        type: String
    },
    likes: {
        type: [String]
    },
    post_date: {
        type: Date,
        default: Date.now()
    }
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;