/*
  This module handles the communication with the Worx Landroid robotic mower
 */

// https://github.com/najaxjs/najax
var najax = require('najax');

var ERROR_MESSAGES = [];
ERROR_MESSAGES[0] = "blade blocked";
ERROR_MESSAGES[1] = "repositioning error";
ERROR_MESSAGES[2] = "wire bounced";
ERROR_MESSAGES[3] = "blade blocked";
ERROR_MESSAGES[4] = "outside wire stopped";
ERROR_MESSAGES[5] = "mower lifted";
ERROR_MESSAGES[6] = "alarm 6";
ERROR_MESSAGES[7] = "upside down";
ERROR_MESSAGES[8] = "alarm 8";
ERROR_MESSAGES[8] = "collision sensor blocked";
ERROR_MESSAGES[10] = "mower tilted";
ERROR_MESSAGES[11] = "charge error";
ERROR_MESSAGES[12] = "battery error";

/**
 * Constructor that takes configuration as arguments
 * @param config
 * @constructor
 */
function Landroid(config) {
  this.serverAndPort = config.serverAndPort;
  this.pinCode = config.pinCode;
}

Landroid.prototype.doPollStatus = function() {
  console.log("About to poll Landroid at " + this.serverAndPort + " for status");
  
  var self = this;
  
  najax({
        url: "http://" + this.serverAndPort + "/jsondata.cgi",
        dataType: "json", // will be "application/json" in version najax 0.2.0
        username: "admin",
        password: this.pinCode
      },
      function (response) {
        if(response) {
          var batteryPercentage = response.perc_batt;
          if(!batteryPercentage) {
            console.error("Make sure your pin code is correc!");
          }
          else {
            // console.log("Response from Landroid, batteryPercentage: " + batteryPercentage);
            self.setBatteryPercentage(batteryPercentage);
            var totalMowingHours = parseInt(response.ore_movimento);
            if(! isNaN(totalMowingHours)) {
              self.setTotalMowingHours(totalMowingHours / 10); // Provided as 0,1 h
            }
            
            if(isAnyAlert(response.allarmi)) {
              self.setError(alertArrayToMessage(response.allarmi));
            }
            else /* if(response.settaggi && response.settaggi[5]) */ { // Charging
              self.setCharging(response.settaggi && response.settaggi[5]);
            }
          }
        }
        else
          console.error("No response!");
      });  
};

/** Get alert messages from array of flags */
function alertArrayToMessage(arr) {
  var output = "";
  if(arr && arr.length > 0) {
    for(var i = 0; i < arr.length; i++) {
      if(arr[i]) { // There was an alert
        var errorMessage = ERROR_MESSAGES[i];
        if(errorMessage)
          output += errorMessage + "; ";
      }
    }
  }
  return output;
}

/** Is there any alert in the provided array? */
function isAnyAlert(arr) {
  if(arr && arr.length > 0) {
    for(var i = 0; i < arr.length; i++) {
      if(arr[i]) { // There was an alert
        return true;
      }
    }
  }
  return false;
}

/** 
 * Start polling the Landroid for status every n seconds. First poll will be triggered before function returns.
 * @param seconds No of senconds between poll. 
 */
Landroid.prototype.pollEvery = function (seconds) {
  this.doPollStatus(); // First poll immediately
  var self = this;
  setInterval(function() { self.doPollStatus() }, seconds * 1000);
};

//////////////////////////////////////////////////////////////////////////////////
// These handlers are supposed to be overridden
Landroid.prototype.setBatteryPercentage = function(batteryPercentage) {
  console.log("Battery percentage: " + batteryPercentage);
};

Landroid.prototype.setTotalMowingHours = function(totalMowingHours) {
  console.log("Total mowing hours: " + totalMowingHours);
};

/*
Landroid.prototype.setMessage = function (alertMessage) {
  console.log("Message: " + alertMessage);
};
*/

Landroid.prototype.setError = function (error) {
  console.log("Error: " + error);
};

Landroid.prototype.setCharging = function (charging) {
  console.log("Charging? " + charging);
};

module.exports = Landroid;