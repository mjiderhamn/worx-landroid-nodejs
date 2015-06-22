# Domoticz adapter for Worx Landroid

This is a small adapter implemented in [Node.JS](https://nodejs.org/), allowing to capture the status [Worx Landroid
robotic mowers](https://www.worxlandroid.com/) sporting a RESTful API (currently models WG796E and WG797E) and publish
to the [Domoticz home automation system](http://domoticz.com/). This allows you, for example, to track the battery
percentage of your mower with the charts made available via the Domoticz GUI.

## Installation

1. Install [Domoticz](http://domoticz.com/) on some supported hardware (PC, Raspberry Pi, ...)
  1. Set up MQTT hardware ...
  2. Create a virtual sensor ...
2. Set up some [MQTT broker/service](https://github.com/mqtt/mqtt.github.io/wiki/servers), such as [Mosquitto](http://mosquitto.org/)
3. Install [Node.JS](https://nodejs.org/)
4. Clone this Git repo `git clone https://github.com/mjiderhamn/worx-landroid-domoticz.git`
5. In the cloned director, run `npm install` to download dependencies
6. Edit the cloned `app.js`
  1. Set the correct URL to the MQTT broker in `mqttBrokerUrl`
  2. Set `serverAndPort` to the IP/hostname '`:`' port (unless port 80) where the Node.JS will reach the Landroid,
     such as `192.168.0.5` or `mylandroid.dynamic-ip-provider.com:8080` (assuming have done Port Forwarding in your
     router from port 8080 to port 80 on your Landroid within your WiFi network.
  3. Set the PIN code of your Landroid in `pinCode`
  4. Set `idx` to ...
7. Start the application by running `node app.js`  
  