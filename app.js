// Settings
var config = require('./config');
var Landroid = require('./landroid');
var Domoticz = require('./domoticz');

// https://www.npmjs.com/package/mqtt
var mqtt = require('mqtt');
var mqttOpts = {
  connectTimeout: 5 * 1000 // Time out after 5 seconds
};

console.log("Connecting to MQTT broker at " + config.mqttBrokerUrl + "...");
var client = mqtt.connect(config.mqttBrokerUrl, mqttOpts);

var domoticz = new Domoticz(client);

var landroid = new Landroid(config);

client.on('connect', function () {
  console.log("Connected to MQTT broker - scheduling polling");
  
  landroid.onBatteryPercent = function(batteryPercentage) { // TODO Improve readability
    // console.log("To be sent to MQTT, batteryPercentage: " + batteryPercentage);
    domoticz.sendPercent(config.idx, batteryPercentage);
  };
  
  landroid.pollEvery(5); // Poll every 5 seconds
});