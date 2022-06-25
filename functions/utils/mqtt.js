const MqttHandler = require("../MQTT/connect");

let mqttClient;

const initializeClient = () => {
  mqttClient = new MqttHandler();
  mqttClient.connect();
};

const sendMessage = (topic, message) => {
  mqttClient.sendMessage(topic, message);
};

const reconnect = () => {
  if (!mqttClient.mqttClient || !mqttClient.mqttClient.connected)
    mqttClient.connect();
};

const blink = (topic, amount) => sendMessage(topic, `on ${amount}`);

module.exports = {
  initializeClient,
  reconnect,
  sendMessage,
  blink,
};
