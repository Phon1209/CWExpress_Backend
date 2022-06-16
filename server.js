const express = require("express");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/test", (req, res, next) => {
  res.json("Hello new app");
});

app.listen(PORT, () => {
  console.log("App started on port ", PORT);
});
