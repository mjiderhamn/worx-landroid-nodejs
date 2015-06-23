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
  
  var landroid = this;
  
  najax({
        url: "http://" + this.serverAndPort + "/jsondata.cgi",
        dataType: "json", // will be "application/json" in version najax 0.2.0
        username: "admin",
        password: this.pinCode
      },
      function (response) {
        if(response) {
          var batteryPercentage = response.perc_batt;
          console.log("Response from Landroid, batteryPercentage: " + batteryPercentage);
          if(batteryPercentage && landroid.onBatteryPercent) {
            landroid.onBatteryPercent(batteryPercentage);
          }
        }
        else
          console.log("No response!");
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

module.exports = Landroid;