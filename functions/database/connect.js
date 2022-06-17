const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    console.info("Trying to connect mongoDB database");
    await mongoose.connect(process.env.mongoURI);
    console.info("mongoDB connected...");
  } catch (err) {
    console.warn("Failed to connect mongoDB database");
    console.error(err);
  }
};

module.exports = connectDatabase;
