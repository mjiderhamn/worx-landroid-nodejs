var config = require('./config'); // Read configuration

// Import project modules
var Landroid = require('./landroid');
var Domoticz = require('./domoticz');

var domoticz = new Domoticz(config);

domoticz.initDevices(); // Detect or auto create devices

var landroid = new Landroid(config);

domoticz.connect(function () {
  
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
  
  setTimeout(function() {
    console.log("Scheduling polling");
    landroid.pollEvery(60); // Poll every 60 seconds
  }, 5 * 1000); // Wait 5 seconds to allow Domoticz to initialize TODO handle pre-init calls
});