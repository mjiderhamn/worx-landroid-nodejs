/*
 This module handles the communcation with Domoticz
 */

function Domoticz(client) {
  this.client = client;
}

/** 
 * Send battery percentage to Domoticz via MQTT
 * @param idx The device Idx
 * @param value The percentage to send
 * */
Domoticz.prototype.sendPercent = function(idx, value) {
  var message = {
    "idx": idx,
    "nvalue": 0,
    "svalue": value
  };

  this.client.publish('domoticz/in', JSON.stringify(message), /* mqttOpts, */ function () {
    console.log("Done publishing value " +  value + " to idx " + idx );
  });
};   

module.exports = Domoticz;