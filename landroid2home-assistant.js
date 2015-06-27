var config = require('./config'); // Read configuration

// Import project modules
var Landroid = require('./landroid');
var LandroidState = Landroid.LandroidState;
var HomeAssistant = require('./home-assistant');

var homeAssistant = new HomeAssistant(config);

var landroid = new Landroid(config);
  
console.log("Scheduling polling");
landroid.pollEvery(60, function(status) { // Poll every 60 seconds
  if(status) { // We got some data back from the Landroid
    // Send data to Home Assistant
    homeAssistant.setNoOfAlarms(status.noOfAlarms);
    homeAssistant.setBatteryPercentage(status.batteryPercentage);
    homeAssistant.setTotalMowingHours(status.totalMowingHours);
    homeAssistant.setState(status.state.toString());
    
    switch (status.state) {
      case LandroidState.ALARM:
        homeAssistant.setState(status.errorMessage ? status.errorMessage : "[Alarm]");
        break;
      case LandroidState.CHARGING:
        homeAssistant.setState("Charging");
        break;
      case LandroidState.CHARGING_COMPLETE:
        homeAssistant.setState("Charging complete");
        break;
      case LandroidState.MOWING:
        homeAssistant.setState("Mowing");
        break;
      case LandroidState.GOING_HOME:
        homeAssistant.setState("Going home");
        break;
      case LandroidState.MANUAL_STOP:
        homeAssistant.setState("Manual stop");
        break;
      case LandroidState.ERROR:
        homeAssistant.setState("ERROR!");
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
