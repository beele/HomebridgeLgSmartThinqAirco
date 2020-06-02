import {AirCooler, FanSpeed, HSwingMode, Mode, VSwingMode, WideqAdapter} from "./wideq-adapter";

export class LgAircoController {

    private readonly adapter: WideqAdapter;

    //Device information
    private airCooler: AirCooler;

    //State
    private isOn: boolean;
    private mode: Mode;
    private currentTemperatureInCelsius: number;
    private targetTemperatureInCelsius: number;
    private swingModeH: HSwingMode;
    private swingModeV: VSwingMode;
    private fanSpeed: FanSpeed;
    private powerDraw: number;

    constructor(airCooler: AirCooler,  updateInterval: number = 30000) {
        this.adapter = new WideqAdapter(airCooler.country, airCooler.language);
        this.airCooler = airCooler;

        this.update();
        setInterval(async () => {
            //TODO: If an action is still pending, postpone state update?
            await this.update();
        }, updateInterval);
    }

    private async update(): Promise<void> {
        const status = await this.adapter.getStatus(this.airCooler.deviceId);
        this.powerDraw = await this.adapter.getCurrentPowerUsage(this.airCooler.deviceId);
        this.isOn = status.isOn;
        this.mode = status.mode;
        this.currentTemperatureInCelsius = status.currentTempInCelsius;
        this.targetTemperatureInCelsius = status.targetTempInCelsius;
        this.fanSpeed = status.fanSpeed;
    }

    public isPoweredOn(): boolean {
        return this.isOn;
    }

    public async setPowerState(powerOn: boolean): Promise<void> {
        if (this.isOn !== powerOn) {
            const succeeded: boolean = await this.adapter.setPowerOnOff(this.airCooler.deviceId, powerOn);
            if (succeeded) {
                this.isOn = powerOn;
            } else {
                throw new Error('Could not change isOn state of the AC unit!');
            }
        }
    }

    public getMode(): Mode {
        return this.mode;
    }

    public async setMode(newTargetMode: Mode): Promise<void> {
        if (this.mode !== newTargetMode) {
            const succeeded: boolean = await this.adapter.setMode(this.airCooler.deviceId, newTargetMode);
            if (succeeded) {
                //Setting any mode will turn on the AC if it is off!
                this.isOn = true;
                this.mode = newTargetMode;
            } else {
                throw new Error('Could not change operational mode of the AC unit!');
            }
        }
    }

    public getCurrentTemperatureInCelsius(): number {
        return this.currentTemperatureInCelsius;
    }

    public getTargetTemperatureInCelsius(): number {
        return this.targetTemperatureInCelsius;
    }

    public async setTargetTemperatureInCelsius(newTargetTemperatureInCelsius: number): Promise<void> {
        if (this.targetTemperatureInCelsius !== newTargetTemperatureInCelsius) {
            const succeeded: boolean = await this.adapter.setTargetTemperature(this.airCooler.deviceId, newTargetTemperatureInCelsius);
            if (succeeded) {
                //Setting any temperature will turn on the AC if it is off!
                this.isOn = true;
                this.targetTemperatureInCelsius = newTargetTemperatureInCelsius;
            } else {
                throw new Error('Could not set new target temperature of the AC unit!');
            }
        }
    }

    public getVerticalSwingMode(): VSwingMode {
        return this.swingModeV;
    }

    public async setVerticalSwingMode(newVerticalSwingMode: VSwingMode): Promise<void> {
        if (this.swingModeV !== newVerticalSwingMode) {
            const succeeded: boolean = await this.adapter.setSwingModeV(this.airCooler.deviceId, newVerticalSwingMode);
            if (succeeded) {
                this.isOn = true;
                this.swingModeV = newVerticalSwingMode;
            } else {
                throw new Error('Could not set new vertical swing mode of the AC unit!');
            }
        }
    }

    public getHorizontalSwingMode(): HSwingMode {
        return this.swingModeH;
    }

    public async setHorizontalSwingMode(newHorizontalSwingMode: HSwingMode): Promise<void> {
        if (this.swingModeH !== newHorizontalSwingMode) {
            const succeeded: boolean = await this.adapter.setSwingModeH(this.airCooler.deviceId, newHorizontalSwingMode);
            if (succeeded) {
                this.isOn = true;
                this.swingModeH = newHorizontalSwingMode;
            } else {
                throw new Error('Could not set new horizontal swing mode of the AC unit!');
            }
        }
    }

    public getFanSpeed(): FanSpeed {
        return this.fanSpeed;
    }

    public async setFanSpeed(newFanSpeed: FanSpeed): Promise<void> {
        if (this.fanSpeed !== newFanSpeed) {
            const succeeded: boolean = await this.adapter.setFanSpeed(this.airCooler.deviceId, newFanSpeed);
            if (succeeded) {
                this.isOn = true;
                this.fanSpeed = newFanSpeed;
            } else {
                throw new Error('Could not set new fan speed of the AC unit!');
            }
        }
    }
}