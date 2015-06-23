# Domoticz adapter for Worx Landroid

This is a small adapter implemented in [Node.JS](https://nodejs.org/), allowing to capture the status [Worx Landroid
robotic mowers](https://www.worxlandroid.com/) sporting a RESTful API (currently models WG796E and WG797E) and publish
to the [Domoticz home automation system](http://domoticz.com/). This allows you, for example, to track the battery
percentage of your mower with the charts made available via the Domoticz GUI.

## Installation

1. Set up some [MQTT broker/service](https://github.com/mqtt/mqtt.github.io/wiki/servers), such as [Mosquitto](http://mosquitto.org/)
  1. Note that on Windows you may need to install OpenSSL, see http://git.eclipse.org/c/mosquitto/org.eclipse.mosquitto.git/tree/readme-windows.txt
     linking to http://slproweb.com/products/Win32OpenSSL.html
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
6. Edit the cloned [`config.js`](config.js). Should be self explanatory.  
   Set `idx` is the same value as you used for your Virtual Sensor above.
7. Start the application by running `node app.js`  

## Response

The JSON response from the Landroid contains the following JSON structure, with Italian names. English explanation 
is inlined as comments.
```javascript
{
    "CntProg": 95,
    "lingua": 0, // Language in use
    "ore_funz": [ // Hours something...
        100,
        122,
        100,
        120,
        110,
        40,
        50
    ],
    "ora_on": [ // Hours per weekday that the Landroid should mow
        4,
        4,
        2,
        3,
        3,
        2,
        2
    ],
    "min_on": [ // Hours per weekday that the Landroid should mow, in addition to the hours above
        0,
        0,
        0,
        0,
        0,
        0,
        0
    ],
    "allarmi": [ // Alarms
        0,
        0,
        0, // Set to 1 when "Outside working area" 
        0,
        0, // Set to 1 when "Outside working area"
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
    ],
    "settaggi": [ // Settings
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        1,
        1,
        1,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0
    ],
    "mac": [ // The MAC address of the Landroid WiFi
        ...,
        ...,
        ...,
        ...,
        ...,
        ...
    ],
    "time_format": 1,
    "date_format": 2,
    "rit_pioggia": 180, // Time to wait after rain, in minutes
    "area": 0,
    "enab_bordo": 1, // Enable edge cutting
    "g_sett_attuale": 1, // Is charging???
    "g_ultimo_bordo": 0,
    "ore_movimento": 626, // Total time the mower has been mowing, expressed in 0,1 h 
    "percent_programmatore": 50, // Percent increase of the automatic area setting
    "indice_area": 9,
    "tipo_lando": 8,
    "beep_hi_low": 0,
    "gradi_ini_diritto": 30, // Something "right"
    "perc_cor_diritto": 103, // Something "right"
    "coef_angolo_retta": 80, // Something "straigt line"
    "scost_zero_retta": 1,   // Something "straigt line"
    "offset_inclinometri": [ // Probably the calibration of the sensors
        2039,
        2035,
        2672
    ],
    "gr_rall_inizio": 80,
    "gr_rall_finale": 300,
    "gr_ini_frenatura": 130,
    "perc_vel_ini_frenatura": 50, // Something "brake" (battery percent when returning to charger???)
    "tempo_frenatura": 20,
    "perc_rallenta_max": 50,
    "canale": 0,
    "num_ricariche_batt": 0,
    "num_aree_lavoro": 4, // Number of zones in use
    "Dist_area": [ // Distance in meters to the zone starts
        18,
        71,
        96,
        129
    ],
    "perc_per_area": [ // Percentage per zone, expressed in 10% increments (i.e. 3 = 30%)
        1,
        2,
        3,
        4
    ],
    "area_in_lavoro": 5,
    "email": "...", // The e-mail address used to log into the app
    "perc_batt": "100" // Charge level of the battery
}
```