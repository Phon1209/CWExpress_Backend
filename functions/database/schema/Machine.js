const mongoose = require("mongoose");

const MachineSchema = mongoose.Schema({
  location: String,
  branch: String,
  machineNumber: Number,
});

module.exports = mongoose.model("Machine", MachineSchema);
