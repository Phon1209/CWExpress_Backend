const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const router = require("./routes/router");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("combined"));

const routeAddress = "/cwex/" + process.env.VERSION;

// Routers
app.use(routeAddress, router);

module.exports = app;
