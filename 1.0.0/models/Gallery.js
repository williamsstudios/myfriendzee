const mongoose = require("mongoose");

const GallerySchema = new mongoose.Schema({
     user: { type: String },
     name: { type: String },
     coverPic: { type: String },
     createAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Gallery", GallerySchema);