import {AirCooler, FanSpeed, HSwingMode, Mode, VSwingMode} from "./wideq-adapter";

export abstract class Controller {

    //Device information
    protected airCooler: AirCooler;

    //State
    protected isOn: boolean;
    protected mode: Mode;
    protected currentTemperatureInCelsius: number;
    protected targetTemperatureInCelsius: number;

    protected targetCoolingTemperatureInCelsius: number;
    protected targetHeatingTemperatureInCelsius: number;

    protected swingModeH: HSwingMode;
    protected swingModeV: VSwingMode;
    protected fanSpeed: FanSpeed;
    protected powerDraw: number;

    constructor() {
    }

    public abstract isPoweredOn(): boolean;

    public async abstract setPowerState(powerOn: boolean): Promise<void>;

    public abstract getMode(): Mode

    public async abstract setMode(newTargetMode: Mode): Promise<void>;

    public abstract getCurrentTemperatureInCelsius(): number;

    public abstract getTargetCoolingTemperatureInCelsius(): number;

    public abstract setTargetCoolingTemperatureInCelsius(newTargetCoolingTemperatureInCelsius: number): void;

    public abstract getTargetHeatingTemperatureInCelsius(): number;

    public abstract setTargetHeatingTemperatureInCelsius(newTargetHeatingTemperatureInCelsius: number): void;

    protected async abstract setTargetTemperatureInCelsius(newTargetTemperatureInCelsius: number): Promise<void>;

    public abstract getVerticalSwingMode(): VSwingMode;

    public async abstract setVerticalSwingMode(newVerticalSwingMode: VSwingMode): Promise<void>;

    public abstract getHorizontalSwingMode(): HSwingMode;

    public async abstract setHorizontalSwingMode(newHorizontalSwingMode: HSwingMode): Promise<void>;

    public abstract getFanSpeed(): FanSpeed;

    public async abstract setFanSpeed(newFanSpeed: FanSpeed): Promise<void>;
}