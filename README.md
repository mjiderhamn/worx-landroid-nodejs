# Domoticz adapter for Worx Landroid

This is a small adapter implemented in [Node.JS](https://nodejs.org/), allowing to capture the status [Worx Landroid
robotic mowers](https://www.worxlandroid.com/) sporting a RESTful API (currently models WG796E and WG797E) and publish
to the [Domoticz home automation system](http://domoticz.com/). This allows you, for example, to track the battery
percentage of your mower with the charts made available via the Domoticz GUI.

## Installation

1. Set up some [MQTT broker/service](https://github.com/mqtt/mqtt.github.io/wiki/servers), such as [Mosquitto](http://mosquitto.org/)
2. Install [Domoticz](http://domoticz.com/) on some supported hardware (PC, Raspberry Pi, ...)
  1. Set up MQTT queue as hardware
    1. Navigate to the Domoticz web GUI (defaults to [http://localhost:8080/](http://localhost:8080/))
    2. Click Setup, Hardware
    3. Enter a Name
    4. Select type `MQTT Client Gateway with LAN interface`
    5. Set Remote Address and Port to where your MQTT broker is (default port is 1883)
  2. [Create a Virtual Sensor in Domoticz](http://www.domoticz.com/wiki/Domoticz_API/JSON_URL's#Create_a_Virtual_Sensor).
    In your browser, go to `http://your-domotics-server:port/json.htm?type=createvirtualsensor&idx=1&sensortype=2`,
    where you will need to set the value of `idx` to an unused device Idx in case you were already using Domoticz for
    something else. Make note of the `idx` you use. (`sensortype=2` means percentage sensor)  
    _If you know of an easier way, please provide a pull request with an update to this readme!_
  3. Enable the Virtual Sensor
    1. In the web GUI go to Setup, Devices
    2. Click the green icon with the right pointing arrow
3. Install [Node.JS](https://nodejs.org/)
4. Clone this Git repo - `git clone https://github.com/mjiderhamn/worx-landroid-domoticz.git`
  (First install [Git](http://git-scm.com/) if not already installed)
5. In the cloned directory, run `npm install` to download dependencies
6. Edit the cloned `app.js`
  1. Set the correct URL to the MQTT broker in `mqttBrokerUrl`
  2. Set `serverAndPort` to the IP/hostname '`:`' port (unless port 80) where the Node.JS will reach the Landroid,
     such as `192.168.0.5` or `mylandroid.dynamic-ip-provider.com:8080` (assuming have done Port Forwarding in your
     router from port 8080 to port 80 on your Landroid within your WiFi network.
  3. Set the PIN code of your Landroid in `pinCode`
  4. Set `idx` to the same value as you used for your Virtual Sensor above.
7. Start the application by running `node app.js`  
  