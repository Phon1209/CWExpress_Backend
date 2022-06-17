const router = require("express").Router();
const MqttHandler = require("../MQTT/connect");
// const { check, validationResult } = require("express-validator");

const mqttClient = new MqttHandler();
mqttClient.connect();

const testTopic = "@msg/TH-CC/PTT-TV/001/task";

router.use((req, res, next) => {
  if (!mqttClient.mqttClient) mqttClient.connect();
  next();
});

router.post("/", (req, res) => {
  const { amount } = req.body;

  try {
    mqttClient.sendMessage(testTopic, `on ${amount}`);
    console.log("message sent");
    res.json("Request sent");
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Bad Request" });
  }
});

module.exports = router;
