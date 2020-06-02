import {AirCooler, FanSpeed, HSwingMode, Mode, VSwingMode} from "./wideq-adapter";
import {Controller} from "./controller";

export class DummyController extends Controller {

    constructor(airCooler: AirCooler,  updateInterval: number = 30000) {
        super();

        this.airCooler = airCooler;

        this.isOn = true;
        this.mode = Mode.COOL;
        this.currentTemperatureInCelsius = 24;
        this.targetTemperatureInCelsius = 18;
        this.fanSpeed = FanSpeed.HIGH;
        this.powerDraw = 50;

        this.swingModeH = HSwingMode.ALL;
        this.swingModeV = VSwingMode.ALL;

        this.targetCoolingTemperatureInCelsius = 18;
        this.targetHeatingTemperatureInCelsius = 18;
    }

    public isPoweredOn(): boolean {
        return this.isOn;
    }

    public async setPowerState(powerOn: boolean): Promise<void> {
        if (this.isOn !== powerOn) {
            this.isOn = powerOn;
            console.log('Setting power value: ' + powerOn);
        }
    }

    public getMode(): Mode {
        return this.mode;
    }

    public async setMode(newTargetMode: Mode): Promise<void> {
        if (this.mode !== newTargetMode) {
            this.isOn = true;
            this.mode = newTargetMode;
            console.log('Setting mode value: ' + newTargetMode);
            await this.setTargetTemperatureInCelsius(this.mode === Mode.COOL ? this.targetCoolingTemperatureInCelsius : this.targetHeatingTemperatureInCelsius);
        }
    }

    public getCurrentTemperatureInCelsius(): number {
        return this.currentTemperatureInCelsius;
    }

    public getTargetCoolingTemperatureInCelsius(): number {
        return this.targetCoolingTemperatureInCelsius;
    }

    public setTargetCoolingTemperatureInCelsius(newTargetCoolingTemperatureInCelsius: number): void {
        if (this.targetCoolingTemperatureInCelsius !== newTargetCoolingTemperatureInCelsius) {
            this.isOn = true;
            this.targetCoolingTemperatureInCelsius = newTargetCoolingTemperatureInCelsius;
        }
    }

    public getTargetHeatingTemperatureInCelsius(): number {
        return this.targetHeatingTemperatureInCelsius;
    }

    public setTargetHeatingTemperatureInCelsius(newTargetHeatingTemperatureInCelsius: number): void {
        if (this.targetHeatingTemperatureInCelsius !== newTargetHeatingTemperatureInCelsius) {
            this.isOn = true;
            this.targetHeatingTemperatureInCelsius = newTargetHeatingTemperatureInCelsius;
        }
    }

    public async setTargetTemperatureInCelsius(newTargetTemperatureInCelsius: number): Promise<void> {
        if (this.targetTemperatureInCelsius !== newTargetTemperatureInCelsius) {
            this.isOn = true;
            this.targetTemperatureInCelsius = newTargetTemperatureInCelsius;
            console.log('Setting temperature value: ' + newTargetTemperatureInCelsius);
        }
    }

    public getVerticalSwingMode(): VSwingMode {
        return this.swingModeV;
    }

    public async setVerticalSwingMode(newVerticalSwingMode: VSwingMode): Promise<void> {
        if (this.swingModeV !== newVerticalSwingMode) {
            this.isOn = true;
            this.swingModeV = newVerticalSwingMode;
            console.log('Setting swing V value: ' + newVerticalSwingMode);
        }
    }

    public getHorizontalSwingMode(): HSwingMode {
        return this.swingModeH;
    }

    public async setHorizontalSwingMode(newHorizontalSwingMode: HSwingMode): Promise<void> {
        if (this.swingModeH !== newHorizontalSwingMode) {
            this.isOn = true;
            this.swingModeH = newHorizontalSwingMode;
            console.log('Setting swing H value: ' + newHorizontalSwingMode);
        }
    }

    public getFanSpeed(): FanSpeed {
        return this.fanSpeed;
    }

    public async setFanSpeed(newFanSpeed: FanSpeed): Promise<void> {
        if (this.fanSpeed !== newFanSpeed) {
            this.isOn = true;
            this.fanSpeed = newFanSpeed;
            console.log('Setting fan speed value: ' + newFanSpeed);
        }
    }
}