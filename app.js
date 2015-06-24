var config = require('./config'); // Read configuration

// Import project modules
var Landroid = require('./landroid');
var Domoticz = require('./domoticz');

var domoticz = new Domoticz(config);

domoticz.initDevices(function() { // Detect or auto create devices
  
  var landroid = new Landroid(config);
  
  // Wire things together
  landroid.setBatteryPercentage = function(batteryPercentage) {
    domoticz.sendBatteryPercentage(batteryPercentage);
  };
  landroid.setTotalMowingHours = function(totalMowingHours) {
    domoticz.setTotalMowingHours(totalMowingHours);
  };
  
  landroid.setNoOfAlarms = function(noOfAlarms) {
    domoticz.setNoOfAlarms(noOfAlarms);
  };
  landroid.setError = function(error) {
    domoticz.setError(error);
  };
  landroid.setCharging = function(charging) {
    domoticz.setCharging(charging);
  };

  domoticz.connect(function () { // Connect to MQTT
    console.log("Scheduling polling");
    landroid.pollEvery(60); // Poll every 60 seconds
  });  
}); 