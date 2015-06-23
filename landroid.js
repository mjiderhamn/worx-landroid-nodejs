/*
  This module handles the communication with the Worx Landroid robotic mower
 */

// https://github.com/najaxjs/najax
var najax = require('najax');

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
          }
        }
        else
          console.error("No response!");
      });  
};

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

module.exports = Landroid;