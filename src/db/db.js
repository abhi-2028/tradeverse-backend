const mongoose = require("mongoose");

const dbURL = process.env.MONGO_URL;

let isConnected = false;

async function connectDB() {
    try {
        await mongoose.connect(dbURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = true;
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}

const dbConnection = (req, res, next) => {
    if (!isConnected) {
        connectDB();
    }
    next();
};

module.exports = dbConnection;
