import {AirCooler, FanSpeed, HSwingMode, Mode, VSwingMode} from "./wideq-adapter";
import {Controller} from "./controller";

export class DummyController extends Controller {

    private logDebug: Function;

    constructor(airCooler: AirCooler,  updateInterval: number, debugLogger: Function) {
        super();

        this.airCooler = airCooler;

        this.isOn = true;
        this.mode = Mode.COOL;
        this.currentTemperatureInCelsius = 24;
        this.fanSpeed = FanSpeed.HIGH;
        this.powerDraw = 50;

        this.swingModeH = HSwingMode.ALL;
        this.swingModeV = VSwingMode.ALL;

        this.targetCoolingTemperatureInCelsius = 18;
        this.targetHeatingTemperatureInCelsius = 21;

        this.logDebug = debugLogger;
    }

    public isPoweredOn(): boolean {
        return this.isOn;
    }

    public async setPowerState(powerOn: boolean): Promise<void> {
        if (this.isOn !== powerOn) {
            this.isOn = powerOn;
            this.logDebug('Setting power value: ' + (powerOn ? 'ON' : 'OFF'));
        }
    }

    public getMode(): Mode {
        this.logDebug('Getting mode value: ' + this.mode);
        return this.mode;
    }

    public async setMode(newTargetMode: Mode): Promise<void> {
        if (this.mode !== newTargetMode) {
            this.isOn = true;
            this.mode = newTargetMode;
            this.logDebug('Setting mode value: ' + newTargetMode);
            await this.setTargetTemperatureInCelsius(this.mode === Mode.COOL ? this.targetCoolingTemperatureInCelsius : this.targetHeatingTemperatureInCelsius);
        } else {
            this.setPowerState(true);
        }
    }

    public getCurrentTemperatureInCelsius(): number {
        this.logDebug('Getting current temperature value: ' + this.currentTemperatureInCelsius);
        return this.currentTemperatureInCelsius;
    }

    public getTargetCoolingTemperatureInCelsius(): number {
        this.logDebug('Getting target temperature value: ' + this.targetCoolingTemperatureInCelsius);
        return this.targetCoolingTemperatureInCelsius;
    }

    public setTargetCoolingTemperatureInCelsius(newTargetCoolingTemperatureInCelsius: number): void {
        if (this.targetCoolingTemperatureInCelsius !== newTargetCoolingTemperatureInCelsius) {
            this.isOn = true;
            this.targetCoolingTemperatureInCelsius = newTargetCoolingTemperatureInCelsius;

            if(this.mode === Mode.COOL) {
                this.setTargetTemperatureInCelsius(this.targetCoolingTemperatureInCelsius);
            }
        }
    }

    public getTargetHeatingTemperatureInCelsius(): number {
        this.logDebug('Getting target heating temperature value: ' + this.targetHeatingTemperatureInCelsius);
        return this.targetHeatingTemperatureInCelsius;
    }

    public setTargetHeatingTemperatureInCelsius(newTargetHeatingTemperatureInCelsius: number): void {
        if (this.targetHeatingTemperatureInCelsius !== newTargetHeatingTemperatureInCelsius) {
            this.isOn = true;
            this.targetHeatingTemperatureInCelsius = newTargetHeatingTemperatureInCelsius;

            if(this.mode === Mode.HEAT) {
                this.setTargetTemperatureInCelsius(this.targetHeatingTemperatureInCelsius);
            }
        }
    }

    public async setTargetTemperatureInCelsius(newTargetTemperatureInCelsius: number): Promise<void> {
        if (this.targetTemperatureInCelsius !== newTargetTemperatureInCelsius) {
            this.isOn = true;
            this.targetTemperatureInCelsius = newTargetTemperatureInCelsius;
            this.logDebug('Setting temperature value: ' + newTargetTemperatureInCelsius);
        }
    }

    public getVerticalSwingMode(): VSwingMode {
        this.logDebug('Getting v-swing value: ' + this.swingModeV);
        return this.swingModeV;
    }

    public async setVerticalSwingMode(newVerticalSwingMode: VSwingMode): Promise<void> {
        if (this.swingModeV !== newVerticalSwingMode) {
            this.isOn = true;
            this.swingModeV = newVerticalSwingMode;
            this.logDebug('Setting swing V value: ' + newVerticalSwingMode);
        }
    }

    public getHorizontalSwingMode(): HSwingMode {
        this.logDebug('Getting h-swing value: ' + this.swingModeH);
        return this.swingModeH;
    }

    public async setHorizontalSwingMode(newHorizontalSwingMode: HSwingMode): Promise<void> {
        if (this.swingModeH !== newHorizontalSwingMode) {
            this.isOn = true;
            this.swingModeH = newHorizontalSwingMode;
            this.logDebug('Setting swing H value: ' + newHorizontalSwingMode);
        }
    }

    public getFanSpeed(): FanSpeed {
        this.logDebug('Getting fan speed value: ' + this.fanSpeed);
        return this.fanSpeed;
    }

    public async setFanSpeed(newFanSpeed: FanSpeed): Promise<void> {
        if (this.fanSpeed !== newFanSpeed) {
            this.isOn = true;
            this.fanSpeed = newFanSpeed;
            this.logDebug('Setting fan speed value: ' + newFanSpeed);
        }
    }
}