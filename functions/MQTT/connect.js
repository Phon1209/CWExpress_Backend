const mqtt = require("mqtt");

class MqttHandler {
  constructor() {
    this.mqttClient = null;
    this.host = process.env.MQTT_HOST;
    this.clientId = process.env.MQTT_CLIENT;
    this.username = process.env.MQTT_TOKEN;
    this.password = process.env.MQTT_SECRET;
  }

  connect(callback) {
    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    console.info("Trying to connect to", process.env.MQTT_HOST);

    this.mqttClient = mqtt.connect(this.host, {
      clientId: this.clientId,
      username: this.username,
      password: this.password,
      reconnectPeriod: 10000,
    });

    // Mqtt error calback
    this.mqttClient.on("error", (err) => {
      console.error(err);
      this.mqttClient.end();
    });

    // Connection callback
    this.mqttClient.on("connect", callback);

    this.mqttClient.on("close", () => {
      console.error(`mqtt client disconnected`);
    });
  }

  // Sends a mqtt message to topic: mytopic
  sendMessage(topic, message) {
    console.info(`[${topic}]: send ${message}`);
    this.mqttClient.publish(topic, message);
  }
}

module.exports = MqttHandler;
