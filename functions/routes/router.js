const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json("Welcome to CWExpress API home page");
});

// routes
router.use("/user", require("./user"));
router.use("/mqtt", require("./mqtt"));
router.use("/machines", require("./machine"));
router.use("/pay", require("./pay"));

module.exports = router;
