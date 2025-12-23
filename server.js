require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/db/db");

module.exports = async (req, res) => {
  await connectDB();      // runs on every cold start
  return app(req, res);   // hands request to Express
};
