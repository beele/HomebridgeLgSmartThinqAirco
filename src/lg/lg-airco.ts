import {HSwingMode, Mode, VSwingMode, WideqAdapter} from "./wideq-adapter";

export class LgAirco {

    private readonly adapter: WideqAdapter;

    //Device information
    private deviceId: string;
    private model: string;

    //State
    private isOn: boolean;
    private mode: Mode;
    private currentTemperatureInCelsius: number;
    private targetTemperatureInCelsius: number;
    private swingModeH: HSwingMode;
    private swingModeV: VSwingMode;
    private powerDraw: number;

    constructor(country: string, language: string, updateInterval: number) {
        this.adapter = new WideqAdapter(country, language);


        //TODO: Assign device info
        this.deviceId = 'dummy-device-id';
        this.model = 'dummy-model-name';

        //TODO: Fetch & assign initial state
        this.isOn = false;
        this.mode = Mode.COOL;
        this.currentTemperatureInCelsius = -1;
        this.targetTemperatureInCelsius = 18;
        this.swingModeH = HSwingMode.ALL;
        this.swingModeV = VSwingMode.ALL;
        this.powerDraw = 0;

        setInterval(async () => {
            //TODO: If an action is still pending, postpone state update?
            const status = await this.adapter.getStatus(this.deviceId);
            this.powerDraw = await this.adapter.getCurrentPowerUsage(this.deviceId);
            this.isOn = status.isOn;
            this.mode = status.mode;
            this.currentTemperatureInCelsius = status.currentTempInCelsius;
            this.targetTemperatureInCelsius = status.targetTempInCelsius;

        }, updateInterval);
    }

    public isPoweredOn(): boolean {
        return this.isOn;
    }

    public async setPowerState(powerOn: boolean): Promise<void> {
        if (this.isOn !== powerOn) {
            const succeeded: boolean = await this.adapter.setPowerOnOff(this.deviceId, powerOn);
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
            const succeeded: boolean = await this.adapter.setMode(this.deviceId, newTargetMode);
            if (succeeded) {
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
            const succeeded: boolean = await this.adapter.setTargetTemperature(this.deviceId, newTargetTemperatureInCelsius);
            if (succeeded) {
                this.targetTemperatureInCelsius = newTargetTemperatureInCelsius;
            } else {
                throw new Error('Could not set new target temperature of the AC unit!');
            }
        }
    }
}