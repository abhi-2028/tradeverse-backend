require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");

// =======================
// DB LOGIC (from db.js)
// =======================

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

// =======================
// EXPRESS APP (from app.js)
// =======================

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.DASHBOARD_URL,
    "http://localhost:3000",
    "http://localhost:3001",
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("CORS not allowed"));
            }
        },
        credentials: true,
    })
);

app.use((req, res, next) => {
    if (!isConnected) {
        connectDB().then(() => next());
    } else {
        next();
    }
});

// =======================
// ROUTES
// =======================

const authRoutes = require("./src/Routes/Auth.routes");
const dashboardRoutes = require("./src/Routes/dashboard.routes");

app.use("/api/auth/user", authRoutes);
app.use("/api/user", dashboardRoutes);

// =======================
// VERCEL HANDLER
// =======================

module.exports = app;
