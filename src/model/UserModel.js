const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const {UserSchema} = require("../schemas/UserSchema");

UserSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 12);
});

module.exports = mongoose.model("User", UserSchema);