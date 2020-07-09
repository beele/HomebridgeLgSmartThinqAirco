# Homebridge Smart Thinq LG Airco

This Homebridge plugin allows control over a Smart Thinq enabled LG Airco unit.

To install this plugin simple type `sudo npm install homebridge-lg-airco -g --unsafe-perm=true`.
Next open the config.json that contains your Homebridge configuration and add a block like the following one to the accessories array:

```json
{
    "accessory": "LgAirCooler",
    "name": "LG Airco",
    "deviceId": "OPTIONAL_DEVICE_ID",
    "model": "AC RAC_056905_WW",
    "country": "BE",
    "language": "en-UK",
    "maxCoolingTemp": 26,
    "minCoolingTemp": 18,
    "maxHeatingTemp": 30,
    "minHeatingTemp": 5,
    "updateInterval": 60000,
    "debug": false,
    "dummy": false
}
```

The accessory name has to be `LgAirCooler` to link to the plugin.  
The `name` field is for the display name in the HomeKit app.  
The `deviceId` field is the device id for you cooler, optional, only provide this if you have more than one AC unit! instructions below how to obtain it!  
The `country` field is the 2 letter country code (XX) of the chosen country of your LG SmartThinq account.  
The `language` field is the 4 letter language code (xx-XX) of the chosen language of your LG SmartThinq account.  
The `model` field is the model of the AC unit being used. This value is used to show in the information section.  
The `maxCoolingTemp` field is the maximum settable temperature when in COOLING mode.  
The `minCoolingTemp` field is the minimum settable temperature when in COOLING mode.  
The `maxHeatingTemp` field is the maximum settable temperature when in HEATING mode.  
The `minHeatingTemp` field is the minimum settable temperature when in HEATING mode.  
The `updateInterval` field is the interval that is used to fetch new state data from the AC unit. In milliseconds!  
The `debug` field is the boolean that enables or disables debug logging, set this to false unless collecting logs.  
The `dummy` field is the boolean that enables mocking out the LG API and will instead use a dummy AC unit with no network calls, only for development & testing!  

The initial state will be fetched shortly after booting your Homebridge instance.
After that an update of the state is performed every minute.

## Requirements

- A SmartThinq compatible LG airco unit (Tested with an PC12SQ NSJ)
- Registered through the V1 LG API!!! V2 API is NOT YET supported!!!

## Setup guide

- Open a terminal on the device where you installed this plugin and type: `cd "$(npm root -g)" && cd homebridge-lg-airco/resources/wideq`
- Your terminal should navigate to the folder, if any error comes up the plugin was not installed correctly!
- Make sure requests has been installed, if not execute: `sudo python3 -m pip install requests`
- Execute the command `python3 example.py -c country-code -l language-code -p path-to-wideq-file-in-homebridge-folder` where you should replace `country-code`, `language-code` and `path-to-homebridge-folder` with the respective values.
  For example: `python3 example.py -c BE -l en-UK -p /home/pi/.homebridge/wideq_state.json`
- Make sure the wideq_state.json does not exist yet! If the file is corrupted, delete it before executing the command again!
- Follow the instructions on the screen, and paste the resulting URL back into the terminal.
  The command will now print out a list of all known devices for your account. If wanted select the one you want and paste the value in the `config.json` file at the `deviceId` field of the corresponding accessory definition.
  It will also generate a file in which the session is stored in the Homebridge folder.
- The plugin is now fully ready to be used in Homebridge!

This code makes use of the `WideQ` library, more information [here](https://github.com/sampsyo/wideq).
Some changes have been made to the included version of the WideQ library.
