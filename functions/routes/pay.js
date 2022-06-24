const router = require("express").Router();

// payment method routing
// only have scb for now
router.use("/scb", require("./payment/scb"));

module.exports = router;
