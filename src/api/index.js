require("dotenv").config();

const app = require("../app");
const connectDB = require("../db/db");

module.exports = async (req, res) => {
  await connectDB();      // runs on every cold start
  return app(req, res);   // hands request to Express
};
