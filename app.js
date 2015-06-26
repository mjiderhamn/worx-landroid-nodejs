var config = require('./config'); // Read configuration

// Import project modules
var Landroid = require('./landroid');
var LandroidState = Landroid.LandroidState;
var Domoticz = require('./domoticz');
var AlertLevel = Domoticz.AlertLevel;

var domoticz = new Domoticz(config);

domoticz.initDevices(function() { // Detect or auto create devices
  
  console.info("You can now navigate to " + config.domoticzUrl + "/#/Utility to see your Landroid status");
  
  var landroid = new Landroid(config);
  
  domoticz.connect(function () { // Connect to MQTT

    console.log("Scheduling polling");
    landroid.pollEvery(60, function(status) { // Poll every 60 seconds
      if(status) { // We got some data back from the Landroid
        // Send data to Domoticz
        domoticz.setNoOfAlarms(status.noOfAlarms);
        domoticz.sendBatteryPercentage(status.batteryPercentage);
        domoticz.setTotalMowingHours(status.totalMowingHours);
        
        switch (status.state) {
          case LandroidState.ALARM:
            domoticz.setAlert(AlertLevel.RED, status.errorMessage ? status.errorMessage : "[Alarm]");
            break;
          case LandroidState.CHARGING:
              domoticz.setAlert(AlertLevel.GREEN, "Charging");
            break;
          case LandroidState.CHARGING_COMPLETE:
            domoticz.setAlert(AlertLevel.GRAY, "Charging complete");
            break;
          case LandroidState.MOWING:
            domoticz.setAlert(AlertLevel.YELLOW, "Mowing");
            break;
          case LandroidState.GOING_HOME:
            domoticz.setAlert(AlertLevel.YELLOW, "Going home");
            break;
          case LandroidState.MANUAL_STOP:
            domoticz.setAlert(AlertLevel.ORANGE, "Manual stop");
            break;
          case LandroidState.ERROR:
            domoticz.setAlert(AlertLevel.ORANGE, "ERROR!");
            break;
          default:
            console.error("Unknown state: " + status.state);
        }
      }
      else {
        domoticz.setError("Error getting update!");
        console.error("Error getting update!");
      }
    });
  });  
}); 