const mongoose = require("mongoose");

const OrderSchema = mongoose.Schema({
  status: {
    type: String,
    enum: ["ACTIVE", "COMPLETED"],
    required: true,
    default: "ACTIVE",
  },
  refNo: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
    default: 1,
  },
  machineID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Machine",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Order", OrderSchema);
