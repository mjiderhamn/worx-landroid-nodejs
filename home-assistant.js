/** Module for communicating with Home Assistant API, see https://home-assistant.io/developers/rest_api.html */

// https://github.com/najaxjs/najax
var najax = require('najax');

var COMPONENT_PREFIX = "landroid.";

function Entity(entityId, friendlyName, unitOfMeasurement) {
  this.entityId = COMPONENT_PREFIX + entityId;
  this.friendlyName = friendlyName;
  this.unitOfMeasurement = unitOfMeasurement;
}

var BATTERY_PERCENT_ENTITY_ID = new Entity("battery_percent", "Battery percent", "%"); 
var TOTAL_MOWING_HOURS_ENTITY_ID = new Entity("total_mowing_hours", "Total mowing hours", "h");
var NO_OF_ALARMS_ENTITY_ID = new Entity("no_of_alarms", "No of alarms");
// var ALERT_ENTITY_ID = new Entity("Alert";
var STATE_ENTITY_ID = new Entity("state", "State");


function HomeAssistant(config) {
  this.homeAssistantUrl = config.homeAssistantUrl;
  this.homeAssistantPassword = config.homeAssistantPassword;
}

HomeAssistant.prototype.ajax = function (type, uri, data, callback) {
  var self = this;

  var url = self.homeAssistantUrl + "/api/" + (uri ? uri : "");
  console.log("About to '" + type + "' to '" + url + "'" + (data ? ": " + JSON.stringify(data) : ""));
  
  najax({
    url: url,
    type: type,
    data: data, // ? JSON.stringify(data) : null,
    contentType: "json", // will be "application/json" in version najax 0.2.0
    dataType: "json", // will be "application/json" in version najax 0.2.0
    headers: {
      "X-HA-Access": self.homeAssistantPassword
    },
    success: function(response) {
      console.log("Response from HomeAssistant: " + JSON.stringify(response));
      if(callback)
        callback(response);
    },
    error: function (response) {
      console.error("Error calling Home Assistant: " + JSON.stringify(response));
    }
  })
};

HomeAssistant.prototype.postState = function (entity, state, callback) {
  this.ajax("POST", "states/" + entity.entityId, {
    state: state,
    attributes: {
      "friendly_name": entity.friendlyName,
      "unit_of_measurement": entity.unitOfMeasurement
    }
  }, callback);
};

HomeAssistant.prototype.setBatteryPercentage = function(batteryPercentage) {
  if(typeof batteryPercentage != "undefined")
    this.postState(BATTERY_PERCENT_ENTITY_ID, batteryPercentage);
};

HomeAssistant.prototype.setTotalMowingHours = function(totalMowingHours) {
  if(typeof totalMowingHours != "undefined")
    this.postState(TOTAL_MOWING_HOURS_ENTITY_ID, totalMowingHours);
};

HomeAssistant.prototype.setNoOfAlarms = function(noOfAlarms) {
  if(typeof noOfAlarms != "undefined")
    this.postState(NO_OF_ALARMS_ENTITY_ID, noOfAlarms);
};

HomeAssistant.prototype.setState = function (state) {
  this.postState(STATE_ENTITY_ID, state);
};

module.exports = HomeAssistant;