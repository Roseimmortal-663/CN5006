const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  booktitle: { type: String, required: true },
  author: { type: String, required: true },
  topic: { type: String },
  format: { type: String },
  pubYear: { type: Number },
});

module.exports = mongoose.model("Books", BookSchema);
