/* Configuration file */
module.exports = {
  config: {
    mqttBrokerUrl: 'mqtt://localhost', // TODO Enter URL to MQTT broker (Mosquitto) - mqtt://test.mosquitto.org may be used for testing
    serverAndPort: "ip:port", // // TODO Enter your IP/server name here
    pinCode: "YOUR PIN CODE", // TODO Enter your PIN here
    // TODO Can we auto generate IDX? http://localhost:5080/json.htm?type=devices&filter=all&used=true&order=Name
    idx: 1 // The IDX of your Domoticz device (percentage) used for the battery level
  }
};