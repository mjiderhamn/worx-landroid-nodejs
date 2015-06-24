var config = require('./config'); // Read configuration

// Import project modules
var Domoticz = require('./domoticz');

var domoticz = new Domoticz(config);

var mqttBrokerUrl = config.mqttBrokerUrl;
if(mqttBrokerUrl && mqttBrokerUrl.indexOf("//") > 0) {
  var address = mqttBrokerUrl.substring(mqttBrokerUrl.indexOf("//") + 2);
  var port = 1883; // Assume default MQTT port
  if(address.indexOf(":") > 0) {
    var colon = address.indexOf(":");
    port = parseInt(address.substring(colon + 1));
    address = address.substring(0, colon);
  }
    
  domoticz.initHardware("MQTT for Landroid", address, port); 
  domoticz.initDevices();
}
else
  console.error("Cannot automatically create Domoticz hardware for MQTT URL: " + mqttBrokerUrl);