const express = require("express");
const router = express.Router();
const sse = require("../sse/sse");
const cors = require("cors");

router.get("/", (req, res) => {
  res.json("Welcome to CWExpress API home page");
});

// routes
router.use("/user", require("./user"));
router.use("/mqtt", require("./mqtt"));
router.use("/machines", require("./machine"));
router.use("/pay", require("./pay"));
router.use("/order", require("./order"));

// sse
router.get("/stream", cors(), sse.init);

module.exports = router;
