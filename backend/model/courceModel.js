const mongoose = require("mongoose");
const CourceSchema = new mongoose.Schema({
   name: { type: String, required: true },
   description: { type: String, required: true },
   price: { type: Number, required: true },
   author: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
});

module.exports = mongoose.model("cources", CourceSchema);
