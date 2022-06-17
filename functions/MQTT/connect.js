const mqtt = require("mqtt");

class MqttHandler {
  constructor() {
    this.mqttClient = null;
    this.host = process.env.MQTT_HOST;
    this.clientId = process.env.MQTT_CLIENT;
    this.username = process.env.MQTT_TOKEN;
    this.password = process.env.MQTT_SECRET;
  }

  connect() {
    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    console.log("Trying to connect to", process.env.MQTT_HOST);

    this.mqttClient = mqtt.connect(this.host, {
      clientId: this.clientId,
      username: this.username,
      password: this.password,
    });

    // Mqtt error calback
    this.mqttClient.on("error", (err) => {
      console.log(err);
      this.mqttClient.end();
    });

    // Connection callback
    this.mqttClient.on("connect", () => {
      console.log(`mqtt client connected`);
    });

    // mqtt subscriptions
    this.mqttClient.subscribe("mytopic", { qos: 0 });

    // When a message arrives, console.log it
    this.mqttClient.on("message", function (topic, message) {
      console.log(`[${topic}]: `, message.toString());
    });

    this.mqttClient.on("close", () => {
      console.log(`mqtt client disconnected`);
      this.mqttClient = null;
    });
  }

  // Sends a mqtt message to topic: mytopic
  sendMessage(topic, message) {
    console.log(`[${topic}]: send ${message}`);
    this.mqttClient.publish(topic, message);
  }
}

module.exports = MqttHandler;
