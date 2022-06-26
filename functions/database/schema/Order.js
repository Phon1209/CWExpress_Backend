const mongoose = require("mongoose");

const OrderSchema = mongoose.Schema({
  status: {
    type: String,
    enum: ["ACTIVE", "COMPLETED"],
    required: true,
    default: "ACTIVE",
  },
  ref1: {
    type: String,
    required: true,
    unique: true,
  },
  ref2: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    default: 1,
  },
  machineID: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Order", OrderSchema);
