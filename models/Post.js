const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    author: {
        type: String
    },
    account_name: {
        type: String
    },
    data: {
        type: String
    },
    image: {
        type: String
    },
    video: {
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

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;