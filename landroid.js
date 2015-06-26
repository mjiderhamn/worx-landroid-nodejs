/*
  This module handles the communication with the Worx Landroid robotic mower
 */

// https://github.com/najaxjs/najax
var najax = require('najax');

var LandroidState = {
  CHARGING: "Charging",
  CHARGING_COMPLETE: "Charging complete",
  MOWING: "Mowing",
  GOING_HOME: "Going home",
  MANUAL_STOP: "Manual stop",
  ALARM: "Alarm",
  ERROR: "Error"
};

var ERROR_MESSAGES = [];
ERROR_MESSAGES[0] = "Blade blocked";
ERROR_MESSAGES[1] = "Repositioning error";
ERROR_MESSAGES[2] = "Wire bounced"; // TODO This does not seem to be an actual error
ERROR_MESSAGES[3] = "Blade blocked";
ERROR_MESSAGES[4] = "Outside wire";
ERROR_MESSAGES[5] = "Mower lifted";
ERROR_MESSAGES[6] = "Alarm 6";
ERROR_MESSAGES[7] = "Upside down";
ERROR_MESSAGES[8] = "Alarm 8";
ERROR_MESSAGES[8] = "Collision sensor blocked";
ERROR_MESSAGES[10] = "Mower tilted";
ERROR_MESSAGES[11] = "Charge error";
ERROR_MESSAGES[12] = "Battery error";

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
        password: this.pinCode,
        success: function(response) {
          var status = null;
          if(response) {
            if(! response.allarmi) { // Response is not what we expected
              console.error("Make sure your pin code is correct!");
            }
            else {
              status = {
                state: null,
                errorMessage: null,

                batteryPercentage: null,
                totalMowingHours: null,
                noOfAlarms: null
              };
              
              status.batteryPercentage = response.perc_batt;
              // console.log("Response from Landroid, batteryPercentage: " + batteryPercentage);
              status.workingTimePercent = response.percent_programmatore;
              
              var totalMowingHours = parseInt(response.ore_movimento);
              if(! isNaN(totalMowingHours)) {
                status.totalMowingHours = totalMowingHours / 10;  // Provided as 0,1 h 
              }
  
              status.noOfAlarms = countAlarms(response.allarmi);
              if(status.noOfAlarms > 0) {
                status.state = LandroidState.ALARM;
                status.errorMessage = alertArrayToMessage(response.allarmi);
              }
              else { // There were no alarms
                if(response.settaggi[14]) {
                  status.state = LandroidState.MANUAL_STOP;
                }
                else if(response.settaggi[5] && ! response.settaggi[13]) {
                  status.state = LandroidState.CHARGING;
                }
                else if(response.settaggi[5] && response.settaggi[13]) {
                  status.state = LandroidState.CHARGING_COMPLETE;
                }
                else if(response.settaggi[5]) {
                  status.state = LandroidState.GOING_HOME;
                }
                else
                  status.state = LandroidState.MOWING;
              }
              
              
            }
          }
          else
            console.error("No response!");
          
          console.log("  Landroid status: " + JSON.stringify(status));

          if(self.updateListener)
            self.updateListener(status);
        },
        error: function (response) {
          console.error("Error communicating with Landroid!");
          if(self.updateListener)
            self.updateListener(null);
        }
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
function countAlarms(arr) {
  var output = 0;
  if(arr) {
    for(var i = 0; i < arr.length; i++) { // Length should be 32
      output += arr[i];
    }
  }
  return output;
}

/** 
 * Start polling the Landroid for status every n seconds. First poll will be triggered before function returns.
 * @param seconds No of senconds between poll.
 * @param updateListener function to be called when there are updates
 */
Landroid.prototype.pollEvery = function (seconds, updateListener) {
  this.updateListener = updateListener;
  this.doPollStatus(); // First poll immediately
  var self = this;
  setInterval(function() { self.doPollStatus() }, seconds * 1000);
};

//////////////////////////////////////////////////////////////////////////////////
// These handlers are supposed to be overridden

Landroid.prototype.setError = function (error) {
  console.log("Error: " + error);
};

module.exports = Landroid;
// Expose LandroidState
module.exports.LandroidState = LandroidState;
