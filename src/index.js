const Wideq = require("./lg/wideq").Wideq;

let Service, Characteristic;

// "accessories": [
//   {
//     "accessory": "HomebridgeLgAirco",
//     "name": "display-name",
//     "id": "cooler-id",
//     "country": "country-code",
//     "language": "language-code"
//   }
// ]

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory('homebridge-lg-airco', 'HomebridgeLgAirco', HomebridgeLgAirco);
};

function HomebridgeLgAirco(log, config) {
    this.service = new Service.HeaterCooler(this.name);
    this.log = log;

    this.deviceId = config['id'];
    this.wideq = new Wideq(config['country'], config['language']);

    this.state = {
        isOn: false,
        isCooling: false,
        isHeating: false,

        currentTemp: 0,
        targetTemp: 18
    };

    this.updateState = () => {
        this.wideq
            .status(this.deviceId)
            .then((status) => {
                if (status) {
                    if (status.Operation) {
                        this.state.isOn = status.Operation.value === '@AC_MAIN_OPERATION_RIGHT_ON_W';
                    }
                    if (status.OpMode) {
                        this.state.isCooling = status.OpMode.value === '@AC_MAIN_OPERATION_MODE_COOL_W';
                        this.state.isHeating = !!this.isCooling;
                    }
                    if (status.TempCur) {
                        this.state.currentTemp = status.TempCur.value;
                    }
                    if (status.TempCfg) {
                        this.state.targetTemp = status.TempCfg.value;
                    }

                    //this.log(this.state);

                    this.getActive((unknown, value) => {
                        this.service.getCharacteristic(Characteristic.Active).updateValue(value);
                    });
                    this.service.getCharacteristic(Characteristic.CurrentTemperature).updateValue(this.state.currentTemp);
                    this.getCurrentHeaterCoolerState((unknown, value) => {
                        this.service.getCharacteristic(Characteristic.CurrentHeaterCoolerState).updateValue(value);
                    });
                }
            })
            .catch((error) => {
               this.log(error);
            });
    };

    setInterval(() => {
        this.updateState();
    }, 60 * 1000);
    this.updateState();
}

HomebridgeLgAirco.prototype = {
    getActive: function (callback) {
        const me = this;
        callback(null, me.state.isOn ? Characteristic.Active.ACTIVE : Characteristic.Active.INACTIVE);
    },
    setActive: function (shouldBeActive, callback) {
        const me = this;

        const isOn = shouldBeActive === Characteristic.Active.ACTIVE;
        me.wideq.turnOnOrOff(me.deviceId, isOn).then((done) => {
           me.isOn = isOn;
        });

        callback(null);
    },
    getCurrentHeaterCoolerState: function (callback) {
        const me = this;

        let stateValue = Characteristic.CurrentHeaterCoolerState.INACTIVE;
        if (me.state.isOn) {
            if (me.state.isCooling) {
                stateValue = Characteristic.CurrentHeaterCoolerState.COOLING;
            } else if (me.state.isHeating) {
                stateValue = Characteristic.CurrentHeaterCoolerState.HEATING;
            } else {
                stateValue = Characteristic.CurrentHeaterCoolerState.IDLE;
            }
        }

        callback(null, stateValue);
    },
    getTargetHeaterCoolerState: function (callback) {
        const me = this;

        let stateValue = Characteristic.TargetHeaterCoolerState.AUTO;
        if (me.state.isOn) {
            if (me.state.isCooling) {
                stateValue = Characteristic.TargetHeaterCoolerState.COOL;
            } else if (me.state.isHeating) {
                stateValue = Characteristic.TargetHeaterCoolerState.HEAT;
            }
        }

        callback(null, stateValue);
    },
    setTargetHeaterCoolerState: function (targetState, callback) {
        const me = this;

        let turnOn = false;
        if (targetState !== Characteristic.TargetHeaterCoolerState.AUTO) {
            turnOn = true;
        }

        me.wideq.turnOnOrOff(me.deviceId, turnOn).then((done) => {
            me.isOn = turnOn;
        });

        callback(null);
    },
    getCurrentTemperature: function (callback) {
        const me = this;
        callback(null, me.state.currentTemp);
    },
    getCoolingThresholdTemperature: function (callback) {
        const me = this;
        callback(null, me.state.targetTemp);
    },
    setCoolingThresholdTemperature: function (targetCoolingTemp, callback) {
        const me = this;

        me.wideq.setTemp(me.deviceId, targetCoolingTemp)
            .then((done) => {
                //Done.
                me.state.targetTemp = targetCoolingTemp;
                this.state.isOn = true;
                this.service.getCharacteristic(Characteristic.Active).updateValue(this.state.isOn ? Characteristic.Active.ACTIVE : Characteristic.Active.INACTIVE);
            })
            .catch((error) => {
                //Error
            });
        callback(null);
    },

    getServices: function () {
        const me = this;

        const informationService = new Service.AccessoryInformation();
        informationService
            .setCharacteristic(Characteristic.Manufacturer, "LG")
            .setCharacteristic(Characteristic.Model, "AIRCO")
            .setCharacteristic(Characteristic.SerialNumber, "1234-5678");


        const activeCharac = me.service.getCharacteristic(Characteristic.Active);
        // Characteristic.Active.INACTIVE = 0
        // Characteristic.Active.ACTIVE = 1
        activeCharac.on('get', me.getActive.bind(me));
        activeCharac.on('set', me.setActive.bind(me));

        const currentHeaterCoolerStateCharac = me.service.getCharacteristic(Characteristic.CurrentHeaterCoolerState);
        // Characteristic.CurrentHeaterCoolerState.INACTIVE = 0;
        // Characteristic.CurrentHeaterCoolerState.IDLE = 1;
        // Characteristic.CurrentHeaterCoolerState.HEATING = 2;
        // Characteristic.CurrentHeaterCoolerState.COOLING = 3;
        currentHeaterCoolerStateCharac.on('get', me.getCurrentHeaterCoolerState.bind(me));

        const targetHeaterCoolerStateCharac = me.service.getCharacteristic(Characteristic.TargetHeaterCoolerState);
        // Characteristic.TargetHeaterCoolerState.AUTO = 0;
        // Characteristic.TargetHeaterCoolerState.HEAT = 1;
        // Characteristic.TargetHeaterCoolerState.COOL = 2;
        targetHeaterCoolerStateCharac.setProps({
            format: Characteristic.Formats.UINT8,
            maxValue: 2,
            minValue: 0,
            validValues: [0],
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
        });
        targetHeaterCoolerStateCharac.on('get', me.getTargetHeaterCoolerState.bind(me));
        targetHeaterCoolerStateCharac.on('set', me.setTargetHeaterCoolerState.bind(me));

        const currentTemperatureCharac = me.service.getCharacteristic(Characteristic.CurrentTemperature);
        // 0 - 100 (in ° Celcius)
        currentTemperatureCharac.on('get', me.getCurrentTemperature.bind(me));

        const coolingThresholdTemperatureCharac = me.service.getCharacteristic(Characteristic.CoolingThresholdTemperature);
        // Default: 10 - 35 (in ° Celcius)
        coolingThresholdTemperatureCharac.setProps({
            format: Characteristic.Formats.FLOAT,
            unit: Characteristic.Units.CELSIUS,
            maxValue: 26,
            minValue: 18,
            minStep: 1,
            perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
        });
        coolingThresholdTemperatureCharac.on('get', me.getCoolingThresholdTemperature.bind(me));
        coolingThresholdTemperatureCharac.on('set', me.setCoolingThresholdTemperature.bind(me));

        return [informationService, me.service];
    }
};
