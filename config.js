/* Configuration file */
module.exports = {
  
  /** The URL of your MQTT broker, such as Mosquitto. Public server mqtt://test.mosquitto.org may be used for testing */ 
  mqttBrokerUrl: 'mqtt://localhost',
  
  /** 
   * The IP/hostname and port, if other port that 80 is used. Examples: "192.168.0.5", "mylandroid.dynamic-ip-provider:8080"
   * The default "Landroid" is how the Landroid identifies itself on the network, and should work in most cases where
   * this application and the Landroid are on the same network.
   */
  serverAndPort: "Landroid",
  
  /** The PIN code to your Landroid */
  pinCode: "YOUR PIN CODE",
  
  /** 
   * The URL to the Domoticz server. The default setting assumes the server is running on the same unit as this app,
   * on the default port (8080)
   */
  domoticzUrl: "http://localhost:8080",
  
  /** The IDX of your Domoticz Virtual Sensor device (percentage) used for the battery level */
  idx: 1 
};