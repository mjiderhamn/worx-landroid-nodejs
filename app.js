// Settings
var mqttBrokerUrl = 'mqtt://localhost'; // TODO Enter URL to MQTT broker (Mosquitto) - mqtt://test.mosquitto.org may be used for testing
var serverAndPort = "ip:port"; // // TODO Enter your IP/server name here
var pinCode = "YOUR PIN CODE"; // TODO Enter your PIN here
var idx = 1; // The IDX of your Domoticz device (percentage) used for the battery level

// https://github.com/najaxjs/najax
var najax = require('najax');

// https://www.npmjs.com/package/mqtt
var mqtt = require('mqtt');
var mqttOpts = {
  connectTimeout: 5 * 1000 // Time out after 5 seconds
};
var client = mqtt.connect(mqttBrokerUrl, mqttOpts);

/** Send battery percentage to Domoticz via MQTT */
function sendBatteryPercentage(batteryPercentage) {
  var message = {
    "idx": idx,
    "nvalue": 0,
    "svalue": batteryPercentage
  };

  client.publish('domoticz/in', JSON.stringify(message), mqttOpts, function () {
    console.log("Done publishing battery percentage: " + batteryPercentage);
  });
}

/** Poll current status from the Landroid */
function pollStatus() {
  console.log("About to poll Landroid for status");
  
  najax({
        url: "http://" + serverAndPort + "/jsondata.cgi",
        dataType: "json", // will be "application/json" in version najax 0.2.0
        username: "admin",
        password: pinCode
      },
      function (response) {
        
        if(response) {
          var batteryPercentage = response.perc_batt;
          console.log("Response from Landroid, batteryPercentage: " + batteryPercentage);
          sendBatteryPercentage(batteryPercentage);
        }
        else
          console.log("No response!");
      });
}

client.on('connect', function () {
  console.log("Connected to MQTT broker - scheduling polling");
  pollStatus(); // First poll immediately
  setInterval(pollStatus, 60 * 1000); // Poll every minute
});