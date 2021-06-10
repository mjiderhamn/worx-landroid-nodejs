/*
  This module handles the communication with the Worx Landroid robotic mower
 */

const http = require('http');

const LandroidState = {
  CHARGING: "Charging",
  CHARGING_COMPLETE: "Charging complete",
  MOWING: "Mowing",
  GOING_HOME: "Going home",
  MANUAL_STOP: "Manual stop",
  ALARM: "Alarm",
  ERROR: "Error"
};

const WIRE_BOUNCED_ALARM_INDEX = 2;

const ERROR_MESSAGES = [];
ERROR_MESSAGES[0] = "Blade blocked";
ERROR_MESSAGES[1] = "Repositioning error";
ERROR_MESSAGES[WIRE_BOUNCED_ALARM_INDEX] = "Wire bounced";
ERROR_MESSAGES[3] = "Blade blocked";
ERROR_MESSAGES[4] = "Outside wire";
ERROR_MESSAGES[5] = "Mower lifted";
ERROR_MESSAGES[6] = "Alarm 6";
ERROR_MESSAGES[7] = "Upside down";
ERROR_MESSAGES[8] = "Alarm 8";
ERROR_MESSAGES[9] = "Collision sensor blocked";
ERROR_MESSAGES[10] = "Mower tilted";
ERROR_MESSAGES[11] = "Charge error";
ERROR_MESSAGES[12] = "Battery error";

class Landroids {
  constructor(config) {
    this.localLandroids = config.localLandroids.map(localLandroid => new LocalLandroid(localLandroid));
  }

  pollEvery(seconds, updateListener) {
    this.localLandroids.forEach(localLandroid => localLandroid.pollEvery(seconds, updateListener));
  }

}

/**
 * Constructor that takes configuration as arguments
 * @param config
 * @constructor
 */
class LocalLandroid {
  constructor(config) {
    this.name = config.name;
    this.landroidUrl = config.url;
    this.pinCode = config.pinCode;
  }

  doPollStatus() {
    console.log("About to poll Landroid at " + this.landroidUrl + " for status");

    const self = this;

    http.get(this.landroidUrl + "/jsondata.cgi", {
      auth: "admin:" + this.pinCode,
      // method: 'POST', // TODO ?
      // headers: {
      //   'Content-Type': 'application/json'
      // },
      timeout: 10 * 1000 // 10 s
    }, (res) => {
      const {statusCode} = res;

      let success = statusCode === 200;
      if(!success) {
        console.log(`HTTP status: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        // Consume response data to free up memory
        res.resume();
      }
      res.setEncoding('utf8'); // TODO

      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(rawData);

          let status = null;
          if(response) {
            if(!response.allarmi) { // Response is not what we expected
              console.error("Make sure your pin code is correct!");
            }
            else {
              status = {
                state: null,
                errorMessage: null,

                batteryPercentage: response.perc_batt,
                totalMowingHours: null,
                noOfAlarms: countAlarms(response.allarmi),
                workingTimePercent: response.percent_programmatore
              };

              const totalMowingHours = parseInt(response.ore_movimento);
              if(!isNaN(totalMowingHours)) {
                status.totalMowingHours = totalMowingHours / 10;  // Provided as 0,1 h
              }

              if(status.noOfAlarms > 0) {
                status.state = LandroidState.ALARM;
                status.errorMessage = alertArrayToMessage(response.allarmi);
              }
              else { // There were no alarms
                if(response.settaggi[14]) {
                  status.state = LandroidState.MANUAL_STOP;
                }
                else if(response.settaggi[5] && !response.settaggi[13]) {
                  status.state = LandroidState.CHARGING;
                }
                else if(response.settaggi[5] && response.settaggi[13]) {
                  status.state = LandroidState.CHARGING_COMPLETE;
                }
                else if(response.settaggi[15]) {
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
            self.updateListener(status, self);
        }
        catch (e) { // Error JSON parsing
          console.error(e.message);
        }
      });
    }).on('error', (e) => {
      console.error(`Problem with request: ${e.message}`);

      console.error("Error communicating with Landroid!");
      if(self.updateListener)
        self.updateListener(null, self);

    }).on('timeout', () => {
      console.error("Timeout communicating with Landroid!");
      if(self.updateListener)
        self.updateListener(null, self);
    });
  }

  /**
   * Start polling the Landroid for status every n seconds. First poll will be triggered before function returns.
   * @param seconds No of senconds between poll.
   * @param updateListener function to be called when there are updates
   */
  pollEvery(seconds, updateListener) {
    this.updateListener = updateListener;
    this.doPollStatus(); // First poll immediately
    const self = this;
    setInterval(function() { self.doPollStatus() }, seconds * 1000);
  }

  //////////////////////////////////////////////////////////////////////////////////
  // These handlers are supposed to be overridden

  setError(error) {
    console.log("Error: " + error);
  }
}

/** Get alert messages from array of flags */
function alertArrayToMessage(arr) {
  let output = "";
  if(arr && arr.length > 0) {
    for(let i = 0; i < arr.length; i++) {
      if(arr[i] && i != WIRE_BOUNCED_ALARM_INDEX) { // There was an alert (ignore wire bounce)
        var errorMessage = ERROR_MESSAGES[i];
        if(errorMessage) {
          if(output) { // Not first error (empty string is falsy) - insert delimiter
            output += "; ";
          }
          output += errorMessage;
        }
      }
    }
  }
  return output;
}

/** Is there any alert in the provided array? */
function countAlarms(arr) {
  let output = 0;
  if(arr) {
    for(let i = 0; i < arr.length; i++) { // Length should be 32
      if(i != WIRE_BOUNCED_ALARM_INDEX) { // Ignore wire bounce
        output += arr[i];
      }
    }
  }
  return output;
}

module.exports = Landroids;
// Expose LandroidState
module.exports.LandroidState = LandroidState;
