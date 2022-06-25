const MqttHandler = require("../MQTT/connect");
const Machine = require("../database/schema/Machine");

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

const topicPath = async (machineID) => {
  try {
    const machine = await Machine.findOne({ _id: machineID });
    const { location, branch, machineNumber } = machine;
    return `@msg/${location}/${branch}/${machineNumber}/task`;
  } catch (err) {
    throw err;
  }
};
module.exports = {
  initializeClient,
  reconnect,
  sendMessage,
  blink,
  topicPath,
};
