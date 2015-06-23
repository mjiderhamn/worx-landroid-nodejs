/*
 This module handles the communication with Domoticz
 */
var mqtt = require('mqtt');
var MqttClient = mqtt.MqttClient;

// https://github.com/najaxjs/najax
var najax = require('najax');

// Constants with names of Virtual Sensor devices used for Landroid 
var BATTERY_PERCENT_DEVICE_NAME = "Worx_Landroid_Battery"; 
var TOTAL_MOWING_MINUTES_DEVICE_NAME = "Worx_Landroid_Mowing_Minutes";

// Constants for sensor types, see https://www.domoticz.com/wiki/Domoticz_API/JSON_URL%27s#Create_a_Virtual_Sensor
var TYPE_PERCENTAGE = 2;

var ALL_DEVICES = {};
ALL_DEVICES[BATTERY_PERCENT_DEVICE_NAME] = TYPE_PERCENTAGE;
ALL_DEVICES[TOTAL_MOWING_MINUTES_DEVICE_NAME] = TYPE_PERCENTAGE; // TODO Should be a counter

// TODO Auto identify or generate IDX + allow overriding
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
 * @param idx The device Idx
 * @param value The percentage to send
 * */
Domoticz.prototype.sendPercent = function(idx, value) { // TODO Use name instead
  var message = {
    "idx": idx,
    "nvalue": 0,
    "svalue": value
  };

  this.client.publish('domoticz/in', JSON.stringify(message), /* mqttOpts, */ function () {
    console.log("Done publishing value " +  value + " to idx " + idx );
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
    }, callback);
};

/** Get the devices defined in Domoticz */
Domoticz.prototype.getDevices = function(callback) {
  this.ajax("type=devices&filter=all&order=Name", function(response) { // TODO Order?
    callback(response ? response.result : null);
  });
};

Domoticz.prototype.getIdxToDeviceName = function (callback) {
  var self = this;
  this.getDevices(function(devices) {
    var output = {}; // Map from Idx to device name will be the output

    if(devices) {
      devices.forEach(function (device) {
        output[device.idx] = device.Name;
      });
      callback(output);
    }
    else {
      callback(null);
    }
  });
}; 

Domoticz.prototype.initDevices = function() {
  var self = this;
  
  this.getIdxToDeviceName(function (idxToName) {
    console.log("IDXs: " + JSON.stringify(idxToName));
    var idxs = Object.keys(idxToName);
    idxs.forEach(function (idx) {
      self.idxByName[idxToName[idx]] = idx;
    });
    
    console.log("Devices identified: " + JSON.stringify(self.idxByName));
    
    var names = Object.keys(self.idxByName); 
    Object.keys(ALL_DEVICES).forEach(function(deviceName) {
      if(names.indexOf(deviceName) < 0) {
        console.log("Device missing, needs to be created: " + deviceName);
        self.createDevice(deviceName);
      }
    });
  });
};

Domoticz.prototype.createDevice = function(name) {
  // idx=0 causes auto generation of new idx
  var self = this;
  var type = ALL_DEVICES[name];
  if(! type)
    throw "Cannot create device without type: " + name;
  
  console.log("Creating device " + name + " with type " + type);
  
  this.ajax("type=createvirtualsensor&idx=0&sensortype=" + type, function (response) { // TODO
    var status = response ? response.status : null;
    if(status != "OK")
      throw "Error creating sensor '" + name + "': " + status;
    else {
      // TODO Find new device IDX
      
      //self.ajax("type=setused&idx=DEVICE_ID&name=" + name /* TODO URL encode */ + "&used=true", function() {
      //  
      //});
      // TODO
    }
  });
};

module.exports = Domoticz;