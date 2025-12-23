require("dotenv").config();
const connectDB = require('../db/db');
const app = require('../app');

connectDB();
port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});