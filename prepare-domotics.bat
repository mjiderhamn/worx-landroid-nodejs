@ECHO OFF
ECHO Preparing Domoticz
CALL npm install
node domoticz-init-mqtt.js