const mongoose = require("mongoose");

const CounterSchema = mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

const Counter = mongoose.model("Counter", CounterSchema);

const getSequenceNextValue = (seqName) => {
  return new Promise((resolve, reject) => {
    Counter.findByIdAndUpdate({ _id: seqName }, { $inc: { seq: 1 } }, function (
      error,
      counter
    ) {
      if (error) return reject(error);
      if (counter) return resolve(counter.seq);
      return resolve(null);
    });
  });
};

const createNewSequence = (seqName) => {
  return new Promise((resolve, reject) => {
    const newSequence = new Counter({
      _id: seqName,
      seq: 0,
    });

    newSequence
      .save()
      .then((newSeq) => resolve(newSeq.seq))
      .catch((err) => reject(err));
  });
};

module.exports = {
  getSequenceNextValue,
  createNewSequence,
};
