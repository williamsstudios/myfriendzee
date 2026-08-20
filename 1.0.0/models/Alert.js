const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema({
     user: { type: String },
     receivers: { type: [String] },
     app: { type: String },
     note: { type: String },
     read: { type: Boolean, default: false },
     createAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Alert", AlertSchema);