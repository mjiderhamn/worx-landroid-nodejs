// https://github.com/najaxjs/najax
var najax = require('najax');

// https://www.npmjs.com/package/mqtt
var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost');

console.log('about to najax');

najax({
    url: "http://ip/jsondata.cgi", // TODO Enter your IP/server name here
    dataType: "json", // will be application/json in version 0.2.0
    username: "admin",
    password: "..." // TODO Enter your PIN here
  }, 
  function(response) {
    if(response) {
      console.log("perc_batt: " + response.perc_batt);
      client.publish('perc_batt', response.perc_batt);
    }
    else
      console.log("No response!");
});

client.on('connect', function () {
  client.subscribe('perc_batt');
});
 
client.on('message', function (topic, message) {
  // message is Buffer 
  console.log(message.toString());
  client.end();
});

console.log('done');