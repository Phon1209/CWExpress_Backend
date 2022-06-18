const router = require("express").Router();
const MqttHandler = require("../MQTT/connect");
const { check, validationResult } = require("express-validator");
const validate = require("../middleware/validator");

const mqttClient = new MqttHandler();
mqttClient.connect();

const testTopic = "@msg/TH-CC/PTT-TV/001/task";

router.use((req, res, next) => {
  if (!mqttClient.mqttClient || !mqttClient.mqttClient.connected)
    mqttClient.connect();
  next();
});

router.post(
  "/",
  [
    check("amount")
      .not()
      .isEmpty()
      .withMessage("number cannot be empty")
      .isNumeric()
      .withMessage("amount has to be a number"),
  ],
  validate,
  (req, res) => {
    const amount = req.body.amount;

    try {
      mqttClient.sendMessage(testTopic, `on ${amount}`);
      console.log("message sent");
      res.json("Request sent");
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Bad Request" });
    }
  }
);

module.exports = router;
