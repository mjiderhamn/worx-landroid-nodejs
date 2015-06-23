var config = require('./config'); // Read configuration

// Import project modules
var Landroid = require('./landroid');
var Domoticz = require('./domoticz');

// https://www.npmjs.com/package/mqtt
var mqtt = require('mqtt');
var mqttOpts = {
  connectTimeout: 5 * 1000 // Time out after 5 seconds
};

console.log("Connecting to MQTT broker at " + config.mqttBrokerUrl + "...");
var client = mqtt.connect(config.mqttBrokerUrl, mqttOpts);

var domoticz = new Domoticz(config, client);

domoticz.initDevices(); // Detect or auto create devices

var landroid = new Landroid(config);

client.on('connect', function () {
  console.log("Connected to MQTT broker - scheduling polling");
  
  landroid.onBatteryPercent = function(batteryPercentage) { // TODO Improve readability
    domoticz.sendBatteryPercentage(batteryPercentage);
  };
  
  landroid.pollEvery(60); // Poll every 60 seconds
});