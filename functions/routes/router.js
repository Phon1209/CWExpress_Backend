const express = require("express");
const router = express.Router();

router.use((req, res, next) => {
  console.log("Time: ", Date.now());
  next();
});

router.get("/", (req, res) => {
  res.json("Welcome to CWExpress API home page");
});

// routes
router.use("/user", require("./user"));
router.use("/mqtt", require("./mqtt"));
router.use("/machines", require("./machine"));

module.exports = router;
