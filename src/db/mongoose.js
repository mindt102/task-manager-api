const mongoose = require("mongoose");
require("dotenv").config();

const DB_URL = process.env.DB_URL;
mongoose
    .connect(DB_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(() => {
        console.log("Connect to Database successfully");
    })
    .catch((error) => {
        console.log(error);
    });
