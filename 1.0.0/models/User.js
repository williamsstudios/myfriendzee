const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
     username: { type: String, required: true, unique: true, trim: true },
     email: { type: String, required: true, unique: true, lowercase: true },
     password: { type: String, required: true },
     accountType: { type: String, enum: ["fan", "artist"], default: "fan" },
     firstname: String,
     lastname: String,
     artistName: String,
     genre: String,
     bio: { type: String, default: "" },
     location: { type: String, default: "" },
     avatar: { type: String, default: "" },
     coverPhoto: { type: String, default: "" },
     website: String,
     favoriteMusic: { type: String, default: "" },
     favoriteArtists: { type: String, default: "" },

     friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
     friendRequestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
     friendRequestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
     followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
     following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

     profileViews: { type: Number, default: 0 },
     online: { type: Boolean, default: false },
     createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);