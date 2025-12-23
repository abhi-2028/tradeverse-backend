const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./Routes/Auth.routes");
const dashboardRoutes = require("./Routes/dashboard.routes");
const dbConnection = require("./db/db");

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

app.use(dbConnection); 
app.use("/api/auth/user", authRoutes);
app.use("/api/user", dashboardRoutes);

module.exports = app;
