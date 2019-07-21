# Homebridge Smart Thinq LG Airco

This Homebridge plugin allows control over a Smart Thinq enabled LG Airco unit.

To install this plugin simple type `sudo npm install homebridge-lg-airco -g --unsafe-perm=true`.
Next open the config.json that contains your Homebridge configuration and add a block like the following one to the accessories array:

```javascript
{
    "accessory": "HomebridgeLgAirco",
    "name": "display-name",
    "id": "cooler-id",
    "country": "country-code",
    "language": "language-code"
}
```

The accessory name has to be `HomebridgeLgAirco` to link to the plugin.
The `name` field is for the display name in the HomeKit app.
The `id` field is the device id for you cooler, instructions below how to obtain it!
The `country` field is the 2 letter country code (XX) of the chosen country of your LG SmartThinq account.
The `language` field is the 4 letter language code (xx-XX) of the chosen language of your LG SmartThinq account.

The initial state will be fetched shortly after booting your homebridge instance. 
After that an update of the state is performed every minute.

## Hardware Requirements

- A SmartThinq compatible LG airco unit


## Setup guide

- After installing the plugin with the command found in the beginning of the readme, with a terminal navigate to the folder where it is installed.
- On a Raspberry Pi this will most likely be located at `/usr/lib/node_modules/homebridge-lg-airco`.
- Once in this folder navigate further down to `resources/wideq`.
- Execute the command `python3 example.py -c "country-code" -l "language-code" -s "wideq_state.json" ls` where you should replace `country-code` and `language-code` with the respective values.
  For example: `python3 example.py -c "BE" -l "en-UK" -state "wideq_state.json" ls`
- Follow the instructions on the screen, and paste the resulting URL back into the terminal.
  The command will now print out a list of all known devices for your account, select the one you want and paste the value in the `config.json` file at the `id field of the corresponding accessory definition.
- The plugin is now fully ready to be used in Homebridge!

This code makes use of the `WideQ` library, more information [here](https://github.com/sampsyo/wideq). 
Some changes have been made to the included version of the WideQ library.