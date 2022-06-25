const express = require("express");
const morgan = require("morgan");
const router = require("./routes/router");
const connectDatabase = require("./database/connect");
const { initializeClient } = require("./utils/mqtt");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("combined"));

connectDatabase();
initializeClient();

const routeAddress = "/cwex/" + process.env.VERSION;

// Routers
app.use(routeAddress, router);

module.exports = app;
