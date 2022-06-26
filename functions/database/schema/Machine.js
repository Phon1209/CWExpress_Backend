const mongoose = require("mongoose");
const Counter = require("./Counter");

const MachineSchema = mongoose.Schema({
  _id: {
    type: Number,
    required: true,
  },

  location: String,
  branch: String,
  machineNumber: Number,
});

MachineSchema.pre("validate", function (next) {
  let doc = this;

  Counter.getSequenceNextValue("Machine")
    .then((nextValue) => {
      console.log(nextValue);
      if (!nextValue) {
        Counter.createNewSequence("Machine")
          .then((newValue) => {
            doc._id = newValue;
            return next();
          })
          .catch((err) => next(err));
      } else {
        doc._id = nextValue;

        return next();
      }
    })
    .catch((err) => next(err));
});

module.exports = mongoose.model("Machine", MachineSchema);
