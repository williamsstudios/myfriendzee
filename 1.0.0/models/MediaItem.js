const mongoose = require("mongoose");

const MediaItemSchema = new mongoose.Schema({
     user: { type: String },
     filename: { type: String },
     caption: { type: String },
     gallery: { type: String },
     likes: { type: [String], default: "" },
     shares: { type: [String], default: "" },
     createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("MediaItem", MediaItemSchema);