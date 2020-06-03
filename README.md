# Homebridge Smart Thinq LG Airco

This Homebridge plugin allows control over a Smart Thinq enabled LG Airco unit.

To install this plugin simple type `sudo npm install homebridge-lg-airco -g --unsafe-perm=true`.
Next open the config.json that contains your Homebridge configuration and add a block like the following one to the accessories array:

```json
{
    "accessory": "LgAirCooler",
    "name": "Airco",
    "deviceId": "OPTIONAL_DEVICE_ID",
    "model": "AC RAC_056905_WW",
    "country": "BE",
    "language": "en-UK",
    "maxCoolingTemp": 26,
    "minCoolingTemp": 18,
    "maxHeatingTemp": 30,
    "minHeatingTemp": 5,
    "updateInterval": 60000
}
```

The accessory name has to be `LgAirCooler` to link to the plugin.
The `name` field is for the display name in the HomeKit app.
The `deviceId` field is the device id for you cooler, optional, only provide this if you have more than one AC unit! instructions below how to obtain it!
The `country` field is the 2 letter country code (XX) of the chosen country of your LG SmartThinq account.
The `language` field is the 4 letter language code (xx-XX) of the chosen language of your LG SmartThinq account.
The `maxCoolingTemp` field is the maximum settable temperature when in COOLING mode.
The `minCoolingTemp` field is the minimum settable temperature when in COOLING mode.
The `maxHeatingTemp` field is the maximum settable temperature when in HEATING mode.
The `minHeatingTemp` field is the minimum settable temperature when in HEATING mode.
The `updateInterval` field is the interval that is used to fetch new state data from the AC unit. In milliseconds!

The initial state will be fetched shortly after booting your Homebridge instance. 
After that an update of the state is performed every minute.

## Requirements

- A SmartThinq compatible LG airco unit (Tested with an PC12SQ NSJ)
- Registered through the V1 LG API!!! V2 API is NOT YET supported!!!


## Setup guide

- After installing the plugin with the command found in the beginning of the readme, with a terminal navigate to the folder where it is installed.
- On a Raspberry Pi this will most likely be located at `/usr/lib/node_modules/homebridge-lg-airco`.
- Once in this folder navigate further down to `resources/wideq`.
- Execute the command `python3 example.py -c "country-code" -l "language-code" -s "wideq_state.json" ls` where you should replace `country-code` and `language-code` with the respective values.
  For example: `python3 example.py -c "BE" -l "en-UK" -s "wideq_state.json" ls`
- Follow the instructions on the screen, and paste the resulting URL back into the terminal.
  The command will now print out a list of all known devices for your account, select the one you want and paste the value in the `config.json` file at the `id` field of the corresponding accessory definition.
  It will also generate a file in which the session is stored.
- The plugin is now fully ready to be used in Homebridge!
- Note! If you update the plugin, make sure to re-execute the command above with your specific parameters! (because updating the plugin removes the file in which the session is stored!)

This code makes use of the `WideQ` library, more information [here](https://github.com/sampsyo/wideq). 
Some changes have been made to the included version of the WideQ library.