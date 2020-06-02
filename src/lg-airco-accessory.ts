import {
    AccessoryConfig,
    AccessoryPlugin,
    API,
    CharacteristicEventTypes,
    CharacteristicGetCallback,
    CharacteristicSetCallback,
    CharacteristicValue,
    Formats,
    HAP,
    Logging,
    Perms,
    Service,
    Units
} from "homebridge";

import {AirCooler, FanSpeed, HSwingMode, Mode, VSwingMode, WideqAdapter} from "./lg/wideq-adapter";
import {LgAircoController} from "./lg/lg-airco-controller";
import {AsyncUtils} from "./utils/async-utils";

export class LgAirCoolerAccessory implements AccessoryPlugin {

    private readonly hap: HAP;
    private readonly log: Logging;
    private readonly config: AccessoryConfig;

    private informationService: Service;
    private heaterCoolerService: Service;

    private airCooler: AirCooler;
    private controller: LgAircoController;

    private handleRotationSpeedSetWithDebounce: Function;

    constructor(log: Logging, config: AccessoryConfig, api: API) {
        this.hap = api.hap;
        this.log = log;
        this.config = config;

        this.informationService = new this.hap.Service.AccessoryInformation()
            .setCharacteristic(this.hap.Characteristic.Manufacturer, 'LG')
            .setCharacteristic(this.hap.Characteristic.Model, 'AIR CONDITIONER')
            .setCharacteristic(this.hap.Characteristic.SerialNumber, this.config.model);
        this.heaterCoolerService = new this.hap.Service.HeaterCooler(this.config.name);

        setTimeout(async () => {
            console.log(this.config);
            const airCoolers: AirCooler[] = await WideqAdapter.listAirCoolers(this.config.country, this.config.language);

            if (airCoolers.length === 1) {
                this.airCooler = airCoolers[0];
            } else if (airCoolers.length > 1) {
                const filteredAirCoolers: AirCooler[] = airCoolers.filter((airCooler: AirCooler) => {
                    return airCooler.deviceId === this.config.deviceId;
                });

                if (filteredAirCoolers.length === 1) {
                    this.airCooler = filteredAirCoolers[0];
                } else {
                    this.log('Cannot find air cooler with id: ' + this.config.deviceId);
                    return;
                }
            } else {
                this.log('No air coolers found!');
                return;
            }

            //TODO: Update interval from config, default now is 30 seconds.
            this.controller = new LgAircoController(this.airCooler);
            this.handleRotationSpeedSetWithDebounce = AsyncUtils.debounce((newFanSpeed: FanSpeed) => {
                this.controller.setFanSpeed(newFanSpeed);
            }, 5000);

            this.heaterCoolerService.getCharacteristic(this.hap.Characteristic.Active)
                .on(CharacteristicEventTypes.GET, this.handleActiveGet.bind(this))
                .on(CharacteristicEventTypes.SET, this.handleActiveSet.bind(this));

            this.heaterCoolerService.getCharacteristic(this.hap.Characteristic.CurrentHeaterCoolerState)
                .on(CharacteristicEventTypes.GET, this.handleCurrentHeaterCoolerStateGet.bind(this));

            this.heaterCoolerService.getCharacteristic(this.hap.Characteristic.TargetHeaterCoolerState)
                .setProps({
                    format: Formats.UINT8,
                    maxValue: 2,
                    minValue: 0,
                    validValues: [1, 2],
                    perms: [Perms.PAIRED_READ, Perms.PAIRED_WRITE, Perms.NOTIFY]
                })
                .on(CharacteristicEventTypes.GET, this.handleTargetHeaterCoolerStateGet.bind(this))
                .on(CharacteristicEventTypes.SET, this.handleTargetHeaterCoolerStateSet.bind(this));

            this.heaterCoolerService.getCharacteristic(this.hap.Characteristic.CurrentTemperature)
                .on(CharacteristicEventTypes.GET, this.handleCurrentTemperatureGet.bind(this));

            this.heaterCoolerService.getCharacteristic(this.hap.Characteristic.CoolingThresholdTemperature)
                .setProps({
                    format: Formats.FLOAT,
                    unit: Units.CELSIUS,
                    maxValue: this.config.maxCoolingTemp,
                    minValue: this.config.minCoolingTemp,
                    minStep: 1,
                    perms: [Perms.PAIRED_READ, Perms.PAIRED_WRITE, Perms.NOTIFY]
                })
                .on(CharacteristicEventTypes.GET, this.handleCoolingThresholdTemperatureGet.bind(this))
                .on(CharacteristicEventTypes.SET, this.handleCoolingThresholdTemperatureSet.bind(this));

            this.heaterCoolerService.getCharacteristic(this.hap.Characteristic.HeatingThresholdTemperature)
                .setProps({
                    format: Formats.FLOAT,
                    unit: Units.CELSIUS,
                    maxValue: this.config.maxHeatingTemp,
                    minValue: this.config.minHeatingTemp,
                    minStep: 1,
                    perms: [Perms.PAIRED_READ, Perms.PAIRED_WRITE, Perms.NOTIFY]
                })
                .on(CharacteristicEventTypes.GET, this.handleHeatingThresholdTemperatureGet.bind(this))
                .on(CharacteristicEventTypes.SET, this.handleHeatingThresholdTemperatureSet.bind(this));

            this.heaterCoolerService.getCharacteristic(this.hap.Characteristic.RotationSpeed)
                .on(CharacteristicEventTypes.GET, this.handleRotationSpeedGet.bind(this))
                .on(CharacteristicEventTypes.SET, this.handleRotationSpeedSet.bind(this));

            this.heaterCoolerService.getCharacteristic(this.hap.Characteristic.SwingMode)
                .on(CharacteristicEventTypes.GET, this.handleSwingModeGet.bind(this))
                .on(CharacteristicEventTypes.SET, this.handleSwingModeSet.bind(this));
        });
    }

    public getServices(): Service[] {
        return [
            this.informationService,
            this.heaterCoolerService
        ];
    }

    public identify(): void {
        this.log("Identify!");
    }

    private handleActiveGet(callback: CharacteristicGetCallback): void {
        console.log('Getting ACTIVE...');
        console.log(this.controller.isPoweredOn() ? this.hap.Characteristic.Active.ACTIVE : this.hap.Characteristic.Active.INACTIVE);
        callback(null, this.controller.isPoweredOn() ? this.hap.Characteristic.Active.ACTIVE : this.hap.Characteristic.Active.INACTIVE);
    }

    private handleActiveSet(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
        console.log('Setting ACTIVE: ' + value);
        //TODO: Implement!
        callback(null);
    }

    private handleCurrentHeaterCoolerStateGet(callback: CharacteristicGetCallback): void {
        console.log('Getting CURRENT STATE...');
        let currentHeaterCoolerState: any;

        if (!this.controller.isPoweredOn()) {
            currentHeaterCoolerState = this.hap.Characteristic.CurrentHeaterCoolerState.INACTIVE;
        } else {
            switch (this.controller.getMode()) {
                case Mode.COOL:
                    currentHeaterCoolerState = this.hap.Characteristic.CurrentHeaterCoolerState.COOLING;
                    break;
                case Mode.HEAT:
                    currentHeaterCoolerState = this.hap.Characteristic.CurrentHeaterCoolerState.HEATING;
                    break;
                case Mode.FAN:
                case Mode.DRY:
                case Mode.AI:
                case Mode.AIRCLEAN:
                case Mode.ACO:
                case Mode.AROMA:
                case Mode.ENERGY_SAVING:
                case Mode.ENERGY_SAVER:
                    currentHeaterCoolerState = this.hap.Characteristic.CurrentHeaterCoolerState.IDLE;
                    break;
            }
        }

        console.log(currentHeaterCoolerState);
        callback(null, currentHeaterCoolerState)
    }

    private handleTargetHeaterCoolerStateGet(callback: CharacteristicGetCallback): void {
        console.log('Getting TARGET STATE...');
        //This is the same in this implementation!
        this.handleCurrentHeaterCoolerStateGet(callback);
    }

    private handleTargetHeaterCoolerStateSet(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
        console.log('Setting TARGET STATE: ' + value);
        //TODO: Implement!
        callback(null);
    }

    private handleCurrentTemperatureGet(callback: CharacteristicGetCallback): void {
        console.log('Getting CURRENT TEMP...');
        console.log(this.controller.getCurrentTemperatureInCelsius());
        callback(null, this.controller.getCurrentTemperatureInCelsius());
    }

    private handleCoolingThresholdTemperatureGet(callback: CharacteristicGetCallback): void {
        console.log('Getting COOLING TEMP...');
        console.log(this.controller.getTargetTemperatureInCelsius());
        callback(null, this.controller.getTargetTemperatureInCelsius());
    }

    private handleCoolingThresholdTemperatureSet(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
        console.log('Setting COOLING TEMP: ' + value);
        //TODO: Implement!
        callback(null);
    }

    private handleHeatingThresholdTemperatureGet(callback: CharacteristicGetCallback): void {
        console.log('Getting HEATING TEMP...');
        console.log(this.controller.getTargetTemperatureInCelsius());
        callback(null, this.controller.getTargetTemperatureInCelsius());
    }

    private handleHeatingThresholdTemperatureSet(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
        console.log('Setting HEATING TEMP: ' + value);
        //TODO: Implement!
        callback(null);
    }

    private handleRotationSpeedGet(callback: CharacteristicGetCallback): void {
        console.log('Getting FAN SPEED...');
        console.log(Math.round(WideqAdapter.fanSpeedToPercentage(this.controller.getFanSpeed())));
        callback(null, Math.round(WideqAdapter.fanSpeedToPercentage(this.controller.getFanSpeed())));
    }

    private handleRotationSpeedSet(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
        console.log('Setting FAN SPEED: ' + value);
        this.handleRotationSpeedSetWithDebounce(value);
        callback(null);
    }

    private handleSwingModeGet(callback: CharacteristicGetCallback): void {
        console.log('Getting SWING MODE...');
        console.log(this.controller.getHorizontalSwingMode() === HSwingMode.ALL &&
        this.controller.getVerticalSwingMode() === VSwingMode.ALL ?
            this.hap.Characteristic.SwingMode.SWING_ENABLED : this.hap.Characteristic.SwingMode.SWING_DISABLED);
        callback(null,
            this.controller.getHorizontalSwingMode() === HSwingMode.ALL &&
            this.controller.getVerticalSwingMode() === VSwingMode.ALL ?
                this.hap.Characteristic.SwingMode.SWING_ENABLED : this.hap.Characteristic.SwingMode.SWING_DISABLED
        );
    }

    private handleSwingModeSet(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
        console.log('Setting SWING MODE: ' + value);
        //TODO: Implement!
        callback(null);
    }
}