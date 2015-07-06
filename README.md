# Home automation integration for Worx Landroid robotic mowers
 
This is a small [Node.JS](https://nodejs.org/) library that allows integrating [Worx Landroid robotic 
mowers](https://www.worxlandroid.com/) with various home automation systems for logging/charting Landroid status such as 
battery percentage and notifications for Landroid alarms.
  
The library is assumed to work with any Landroid sporting WiFi and a RESTful API (currently models WG796E and WG797E),
and has been tested with WG796E firmware version 12.1. Please report any breaking changes to the API.

## Common installation
(_The installation instructions make reference to .bat files. If you are not on Windows, you are assumed to know what to
do..._)

Regardless of the home automation system you are planning to use, you need to do the following:

1. Install [Node.JS](https://nodejs.org/). Make sure you allow `npm` to be on your `PATH`.
2. Clone this Git repo - `git clone https://github.com/mjiderhamn/worx-landroid-nodejs.git`
  (First install [Git](http://git-scm.com/) if not already installed). Or by all means use the
  [GitHub Windows client](https://windows.github.com/).
3. Run `install.bat` to download dependencies.
4. Edit the cloned [`config.js`](config.js). Should be self explanatory. Although you may want to wait with this step until
  you have installed your home automation software, since you will need some details from that installation.

## Domoticz

If you plan to use [Domoticz home automation system](http://domoticz.com/), follow these additional steps: 

1. Set up some [MQTT broker/service](https://github.com/mqtt/mqtt.github.io/wiki/servers), such as [Mosquitto](http://mosquitto.org/)
  1. Note that on Windows you may need to install OpenSSL, see http://git.eclipse.org/c/mosquitto/org.eclipse.mosquitto.git/tree/readme-windows.txt
     linking to http://slproweb.com/products/Win32OpenSSL.html
2. Install [Domoticz](http://domoticz.com/) on some supported hardware (PC, Raspberry Pi, ...). 
3. Start sending Landroid data to Domoticz by running `landroid2domoticz.bat` 
4. Use your browser and navigate to _Utility_ in the Domoticz UI.

## Home Assistant
If you plan to use [Home Assistant](https://home-assistant.io), first read the notes below and then follow the 
instructions at https://home-assistant.io/getting-started/.
 
### Notes
You may need to exchange the `python3` commands for `python`, depending on your installation.

If you plan to use Home Assistant only for your Landroid, you can simplify the installation: Between the `git clone ...` and 
`python3 -m pip install ...` commands as per the install instructions, edit the `requirements.txt` file (if you are not 
used to Git you may want to create a local backup first) and remove or comment out (by starting the line with `#`) 
everything below the line 
> `# Optional, needed for specific components`

To start sending Landroid information to Home Assistant run `landroid2home-assistant.bat`.

## Worx Landroid REST API JSON response

The JSON response from the Landroid contains the following JSON structure, with Italian names. English explanation 
is inlined as comments.
```javascript
{
    "CntProg": 95, // Firmware version?????
    "lingua": 0, // Language in use
    "ore_funz": [ // Decides for how long the mower will work each day, probably expressed as 0,1 h
        100,
        122,
        100,
        120,
        110,
        40,
        50
    ],
    "ora_on": [ // Hour of day that the Landroid should mowing, per weekday
        4,
        4,
        2,
        3,
        3,
        2,
        2
    ],
    "min_on": [ // Minutes on the hour (above) that the Landroid should start mowing, per weekday
        0,
        0,
        0,
        0,
        0,
        0,
        0
    ],
    "allarmi": [ // Alarms - flags set to 1 when alarm is active
        0, // [0] "Blade blocked"
        0, // [1] "Repositioning error"
        0, // [2] "Outside wire" ("Outside working area") 
        0, // [3] "Blade blocked"
        0, // [4] "Outside wire" ("Outside working area")
        0, // [5] "Mower lifted" ("Lifted up")
        0, // [6] "error"
        0, // [7] "error" (Set when "Lifted up" - "Upside down"?)
        0, // [8] "error"
        0, // [9] "Collision sensor blocked"
        0, // [10] "Mower tilted"
        0, // [11] "Charge error" (Set when "Lifted up"?)
        0, // [12] "Battery error"
        0, // Reserved for future use?
        0, // -- " --
        0, // -- " --
        0, // -- " --
        0, // -- " --
        0, // -- " --
        0, // -- " --
        0, // -- " --
        0, // -- " --
        0, // -- " --
        0, // -- " --
        0, // -- " --
        0, // -- " --
        0, // -- " --
        0, // -- " --
        0, // -- " --
        0, // -- " --
        0  // -- " --
    ],
    "settaggi": [ // Settings / state
        0,
        0,
        0,
        0,
        1,
        0, // "in base" ("charging" or "charging completed", see [13])
        0,
        1,
        1,
        1,
        0,
        0, // "start"
        0, // "stop"
        0, // "charging completed"
        0, // "manual stop"
        0, // "going home"
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
    "time_format": 1, // Time format
    "date_format": 2, // Date format
    "rit_pioggia": 180, // Time to wait after rain, in minutes
    "area": 0,
    "enab_bordo": 1, // Enable edge cutting
    "g_sett_attuale": 1, // Is charging???
    "g_ultimo_bordo": 0,
    "ore_movimento": 626, // Total time the mower has been mowing, expressed in 0,1 h 
    "percent_programmatore": 50, // Working time percent (increase)
    "indice_area": 9, // Garden size, assumed to be in 100 m^2
    "tipo_lando": 8,
    "beep_hi_low": 0,
    "gradi_ini_diritto": 30, // Something "right"?
    "perc_cor_diritto": 103, // Something "right"?
    "coef_angolo_retta": 80, // Something "straigt line"?
    "scost_zero_retta": 1,   // Something "straigt line"?
    "offset_inclinometri": [ // Probably the calibration of the sensors?
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