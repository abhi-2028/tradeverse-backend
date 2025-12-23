const { Schema, model } = require("mongoose");

module.exports.WatchListSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: Number,
  percent: String,
  isDown: Boolean,
});
