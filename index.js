const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config();
const wikiRoute = require("./routes/wiki.route")
mongoose.connect(process.env.MONGO)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });
app.use(
    cors({
        origin: process.env.ORIGIN,
        methods: ["GET", "POST"],
        credentials: true
    }))
app.use(cookieParser())
app.use(express.json());
app.use('/', wikiRoute)

app.listen(3000, () => {
    console.log("App is listning on port 3000")
})

module.exports = app;