const router = require("express").Router();
const MqttHandler = require("../MQTT/connect");
// const { check, validationResult } = require("express-validator");

const mqttClient = new MqttHandler();
mqttClient.connect();

const testTopic = "@msg/TH-CC/PTT-TV/001/task";

router.use((req, res, next) => {
  if (!mqttClient.mqttClient || !mqttClient.mqttClient.connected)
    mqttClient.connect();
  next();
});

// Test endpoint
router.get("/:amount", (req, res) => {
  const amount = Number(req.params.amount);
  try {
    console.log(typeof amount);
    if (isNaN(amount)) throw new Error("amount is not number!");

    mqttClient.sendMessage(testTopic, `on ${amount}`);
    console.log("message sent");
    res.json("Request sent");
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Bad Request" });
  }
});

router.post("/", (req, res) => {
  const { amount } = Number(req.body);

  try {
    if (isNaN(amount)) throw new Error("amount is not number!");

    mqttClient.sendMessage(testTopic, `on ${amount}`);
    console.log("message sent");
    res.json("Request sent");
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Bad Request" });
  }
});

module.exports = router;
