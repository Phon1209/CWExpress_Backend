const MqttHandler = require("../MQTT/connect");
const Machine = require("../database/schema/Machine");
const provinceJSON = require("../database/province.json");

let mqttClient;

const initializeClient = () => {
  mqttClient = new MqttHandler();
  mqttClient.connect(() => {
    console.info(`mqtt client connected`);
  });
};

const sendMessage = (topic, message) => {
  if (mqttClient.mqttClient.connected) mqttClient.sendMessage(topic, message);
  else {
    mqttClient.connect(() => {
      mqttClient.sendMessage(topic, message);
    });
  }
};

const blink = (topic, amount) => sendMessage(topic, `on ${amount}`);

const topicPath = async (machineID) => {
  try {
    const machine = await Machine.findOne({ _id: machineID });
    const { location } = machine;
    return `@msg/${provinceJSON[location]}/${machineID}/task`;
  } catch (err) {
    throw err;
  }
};
module.exports = {
  initializeClient,
  sendMessage,
  blink,
  topicPath,
};
