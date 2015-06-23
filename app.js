// Settings
var config = require('./config');
var Landroid = require('./landroid');

// https://www.npmjs.com/package/mqtt
var mqtt = require('mqtt');
var mqttOpts = {
  connectTimeout: 5 * 1000 // Time out after 5 seconds
};

console.log("Connecting to MQTT broker at " + config.mqttBrokerUrl + "...");
var client = mqtt.connect(config.mqttBrokerUrl, mqttOpts);

/** Send battery percentage to Domoticz via MQTT */
function sendBatteryPercentage(batteryPercentage) {
  var message = {
    "idx": config.idx,
    "nvalue": 0,
    "svalue": batteryPercentage
  };

  client.publish('domoticz/in', JSON.stringify(message), mqttOpts, function () {
    console.log("Done publishing battery percentage: " + batteryPercentage);
  });
}

var landroid = new Landroid(config);

client.on('connect', function () {
  console.log("Connected to MQTT broker - scheduling polling");
  
  landroid.onBatteryPercent = function(batteryPercentage) { // TODO Improve readability
    console.log("To be sent to MQTT, batteryPercentage: " + batteryPercentage);
    sendBatteryPercentage(batteryPercentage);
  };
  
  landroid.pollEvery(5); // Poll every 5 seconds
});