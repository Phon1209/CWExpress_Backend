const router = require("express").Router();
const Order = require("../database/schema/Order");

// @route   GET  /order/history
// @desc    list all order sorted by createdAt
// @access  Private
router.get("/history", async (req, res) => {
  try {
    const orders = await Order.find()
      .sort("createdAt")
      .select("status amount createdAt -_id");
    return res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// @route   POST  /order/cleanup
// @desc    delete all active orders
// @access  Private
router.post("/cleanup", async (req, res) => {
  try {
    const deleteInformation = await Order.deleteMany({ status: "ACTIVE" });
    res.json(deleteInformation);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

module.exports = router;
