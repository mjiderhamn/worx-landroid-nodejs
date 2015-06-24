/*
 This module handles the communication with Domoticz
 */
// TODO allow overriding auto generated idx

var mqtt = require('mqtt');
var MqttClient = mqtt.MqttClient;

// https://github.com/najaxjs/najax
var najax = require('najax');

// Constants with names of Virtual Sensor devices used for Landroid 
var DEVICE_NAME_PREFIX = "Worx_Landroid_";
var BATTERY_PERCENT_DEVICE_NAME = DEVICE_NAME_PREFIX + "Battery"; 
var TOTAL_MOWING_HOURS_DEVICE_NAME = DEVICE_NAME_PREFIX + "Mowing_Hours";
var NO_OF_ALARMS_DEVICE_NAME = DEVICE_NAME_PREFIX + "No_Of_Alarms";
var ALERT_DEVICE_NAME = DEVICE_NAME_PREFIX + "Alert";
// var MESSAGE_DEVICE_NAME = DEVICE_NAME_PREFIX + "Message";

// Constants for sensor types, see https://www.domoticz.com/wiki/Domoticz_API/JSON_URL%27s#Create_a_Virtual_Sensor
var TYPE_PERCENTAGE = 2;
var TYPE_TEXT = 5;
var TYPE_ALERT = 7;
var TYPE_RFXMETER = 113; // Subtype counter is hard coded

var ALL_DEVICES = {};
ALL_DEVICES[BATTERY_PERCENT_DEVICE_NAME] = TYPE_PERCENTAGE;
ALL_DEVICES[TOTAL_MOWING_HOURS_DEVICE_NAME] = TYPE_RFXMETER;
ALL_DEVICES[NO_OF_ALARMS_DEVICE_NAME] = TYPE_RFXMETER;
ALL_DEVICES[ALERT_DEVICE_NAME] = TYPE_ALERT;
// ALL_DEVICES[MESSAGE_DEVICE_NAME] = TYPE_TEXT;

var LEVEL_GRAY = 0;
var LEVEL_GREEN = 1;
var LEVEL_YELLOW = 2;
var LEVEL_ORANGE = 3;
var LEVEL_RED = 4;

// TODO addhardware
// https://github.com/domoticz/domoticz/blob/master/main/WebServer.cpp#L364

function Domoticz(options, client) {
  if(client instanceof MqttClient) {
    this.client = client;
  }
  else {
    // TODO
  }
  
  if(options && options.domoticzUrl) {
    this.domoticzUrl = options.domoticzUrl;
  }
  this.idxByName = {};
}

/** 
 * Send battery percentage to Domoticz via MQTT
 * @param name Name of device to update
 * @param svalue The string value to send
 * @param nvalue Optional numeric value to send
 * */
Domoticz.prototype.sendValue = function(name, svalue, nvalue) {
  var idx = this.idxByName[name];
  if(! idx)
    throw ("No idx for " + name);
  
  var message = {
    "idx": idx,
    "nvalue": nvalue ? nvalue : 0,
    "svalue": (typeof svalue != "undefined") ? svalue.toString() : ""
  };

  this.client.publish('domoticz/in', JSON.stringify(message), /* mqttOpts, */ function () {
    // console.log("Done publishing " + JSON.stringify(message) + " to idx " + idx );
  });
};

/**
 * Make AJAX call to Domoticz
 * @param query
 * @param callback
 */
Domoticz.prototype.ajax = function(query, callback) {
  if(! this.domoticzUrl)
    throw "domoticzUrl must be set";

  var self = this;
  najax({
      url: self.domoticzUrl + "/json.htm?" + query,
      dataType: "json" // will be "application/json" in version najax 0.2.0
    }, 
    function(response){
      if(! self.isResponseOk(response))
        console.error("Response to " + query + ": " + JSON.stringify(response));// Enable for more logging
      // else console.log("Response to " + query + ": " + JSON.stringify(response));// Enable for more logging
      callback(response);
  });
};

/** Check if JSON response seems ok */
Domoticz.prototype.isResponseOk = function (response) {
  return response && response.status == "OK";
};

/** Get the devices defined in Domoticz */
Domoticz.prototype.getDevices = function(callback) {
  this.ajax("type=devices&filter=all", function(response) {
    callback(response ? response.result : null);
  });
};

Domoticz.prototype.getIdxToDevice = function (callback) {
  var self = this;
  this.getDevices(function(devices) {
    var output = {}; // Map from Idx to device name will be the output

    if(devices) {
      devices.forEach(function (device) {
        output[device.idx] = device;
      });
      callback(output);
    }
    else {
      callback(null);
    }
  });
}; 

/** Find or create Domoticz Virtual Sensor Devices to be used */
Domoticz.prototype.initDevices = function() {
  console.log("Initializing devices on " + this.domoticzUrl);
  
  // TODO addhardware if not found
  /*
  this.ajax("type=gethardwaretypes", function (response) {
    console.log("Hardware types: " + JSON.stringify(response));
  });
  */
  
  var self = this;
  
  this.getIdxToDevice(function (idxToDevice) {
    if(idxToDevice) {
      // console.log("All devices: " + JSON.stringify(idxToDevice));
      Object.keys(idxToDevice).forEach(function (idx) {
        self.idxByName[idxToDevice[idx].Name] = parseInt(idx);
      });

      console.log("Devices identified: " + JSON.stringify(self.idxByName));

    }
    else
      console.log("No existing devices found");

    self.createMissingDevices(0, idxToDevice);
  });
};

Domoticz.prototype.createMissingDevices = function(index, idxToDevice) {
  var self = this;
  
  // NOTE! That we must wait until the previous device has finished processing, or there will be conflicts

  var deviceNames = Object.keys(self.idxByName);
  var allDeviceNames = Object.keys(ALL_DEVICES);
  if(index < allDeviceNames.length) {
    var deviceName = allDeviceNames[index];
    console.log("Making sure device exists: " + deviceName);
    if(deviceNames.indexOf(deviceName) < 0) { // Does not exist
      console.log("Device missing, needs to be created: " + deviceName);
      
      self.createVirtualSensor(deviceName, function(idx) {
        self.idxByName[deviceName] = idx;
        self.setUsed(idx, deviceName);
        
        self.createMissingDevices(index + 1, idxToDevice); // Continue with next device
      });
    }
    else {
      var idx = self.idxByName[deviceName];
      if(! idxToDevice[idx].Used) {
        console.log("Device exists but needs to be used: " + deviceName);
        // console.log("Making sure idx " + idx + " '" + deviceName + "' is use");
        self.setUsed(idx, deviceName);
      }
      self.createMissingDevices(index + 1, idxToDevice); // Continue with next device immediately, as there is no risk of mixup
    }
  }
};

Domoticz.prototype.createVirtualSensor = function (name, callback) {
  var type = ALL_DEVICES[name];
  if(! type)
    throw "Cannot create device without type: " + name;

  var self = this;
  
  console.log("Creating device " + name + " with type " + type);
  
  // idx=0 causes auto generation of new idx
  this.ajax("type=createvirtualsensor&idx=0&sensortype=" + type, function (response) {
    if(! self.isResponseOk(response))
      throw "Error creating sensor '" + name + "': " + status;
    else {
      console.log("New device created, looking for its idx");
      self.getIdxToDevice(function(idxToDevice) {
        // console.log("Devices after create: " + JSON.stringify(idxToDevice));
        var idxToUse = -1;
        Object.keys(idxToDevice).forEach(function (idx) {
          idx = parseInt(idx);
          if(idxToDevice[idx].Name == "Unknown") {
            if(idx > idxToUse) {
              console.log("Found \"Unknown\" device with idx: " + idx);
              idxToUse = idx;
            }
          }
        });
        
        console.log("New device for " + name + " idx: " + idxToUse);
        callback(idxToUse);
      });
    }
  });
};

/**
 * Make device in use and (re)set the name
 * @param idx
 * @param name
 */
Domoticz.prototype.setUsed = function (idx, name) {
  var self = this;
  var subtype = (ALL_DEVICES[name] == TYPE_RFXMETER) ? "&switchtype=3" : ""; // 3 = Counter
  self.ajax("type=setused&idx=" + idx + "&name=" + encodeURIComponent(name) + subtype + "&used=true", function(response) {
    // This seems to always return error, even though the intended operation is performed
    /*
    if(self.isResponseOk(response))
      console.log("Enabled idx " + idx + ": " + name);
    else
      console.error("Error making " + idx + " used");
    */
  });
};

Domoticz.prototype.sendBatteryPercentage = function(batteryPercentage) {
  this.sendValue(BATTERY_PERCENT_DEVICE_NAME, batteryPercentage);
};

Domoticz.prototype.setTotalMowingHours = function(totalMowingHours) {
  this.sendValue(TOTAL_MOWING_HOURS_DEVICE_NAME, totalMowingHours);
};

/*
Domoticz.prototype.setMessage = function(alertMessage) {
  this.sendValue(MESSAGE_DEVICE_NAME, alertMessage);
};
*/

Domoticz.prototype.setNoOfAlarms = function(noOfAlarms) {
  this.sendValue(NO_OF_ALARMS_DEVICE_NAME, noOfAlarms);
};

Domoticz.prototype.setError = function(error) {
  this.sendValue(ALERT_DEVICE_NAME, error ? error : "Unknown error", LEVEL_RED);
};

Domoticz.prototype.setCharging = function(charging) {
  if(charging)
    this.sendValue(ALERT_DEVICE_NAME, "Charging", LEVEL_GREEN);
  else
    this.sendValue(ALERT_DEVICE_NAME, "-", LEVEL_GRAY);
};

module.exports = Domoticz;