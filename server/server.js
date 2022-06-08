const express = require("express");
const path = require("path");
const app = express();
require("dotenv").config();
const publicPath = path.join(__dirname, "/../public");

// Middleware
// handle application/json to json body
app.use(express.json());
// parse parse application/x-www-form-urlencoded to object
app.use(express.urlencoded({ extended: false }));

app.use(express.static(publicPath));

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`server started at PORT ${PORT}`);
});
