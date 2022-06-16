const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routers
// app.use("route", router);

app.get("/test", (req, res) => {
  res.json("Hello");
});

module.exports = app;
