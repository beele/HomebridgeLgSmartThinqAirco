import {PythonUtils} from "../utils/python-utils";

const {resolve} = require('path');

export class WideqAdapter {

    private static readonly wideqFolder: string = resolve(__dirname + '../../../resources/wideq/');
    private static readonly wideqScriptFile: string = 'example.py';

    private readonly country: string;
    private readonly language: string;

    //TODO: Build in some kind of queue since wideq is using and updating the one state file. Multiple concurrent python instances can give issues when they are all trying to change the state file!

    constructor(country: string, language: string) {
        this.country = country;
        this.language = language;
    }

    public static async listAirCoolers(country: string, language: string): Promise<Array<AirCooler>> {
        const data: string = await PythonUtils.executePython3(this.wideqFolder, this.wideqScriptFile, ['-c ' + country, '-l ' + language, '-v', 'ls']);

        const devices = data.split('\n');

        const processedDevices: AirCooler[] = [];
        for (const device of devices) {
            const deviceInfoValues = device.split(':');

            if (deviceInfoValues.length > 1) {
                const modelInfoValues = deviceInfoValues[1].split('(');

                const deviceId: string = deviceInfoValues[0].trim();
                const deviceType: string = modelInfoValues[0].trim();
                const modelName: string = modelInfoValues[1].replace(')', '').trim();
                processedDevices.push({
                    deviceId,
                    deviceType,
                    modelName,
                    country,
                    language
                });
            }
        }

        return processedDevices;
    }

    public async getStatus(deviceId: string): Promise<AirCoolerStatus> {
        try {
            const data: string = await PythonUtils.executePython3(WideqAdapter.wideqFolder, WideqAdapter.wideqScriptFile, ['-c ' + this.country, '-l ' + this.language, '-v', 'ac-mon ' + deviceId], true);
            console.log(data);

            const dataPieces: string[] = data.split(';').map(s => s.trim());
            console.log(dataPieces);
            return {
                isOn: dataPieces[0].toLowerCase() === 'on',
                mode: (<any>Mode)[dataPieces[1]],
                currentTempInCelsius: parseFloat(dataPieces[2].substring(4)),
                targetTempInCelsius: parseFloat(dataPieces[3].substring(4)),
                fanSpeed: (<any>FanSpeed)[dataPieces[4].substring(10)]
            };
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    public async getCurrentPowerUsage(deviceId: string): Promise<number> {
        try {
            const data: string = await PythonUtils.executePython3(WideqAdapter.wideqFolder, WideqAdapter.wideqScriptFile, ['-c ' + this.country, '-l ' + this.language, '-v', 'get-power-draw ' + deviceId]);
            console.log(data);
            return parseInt(data);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    public async setPowerOnOff(deviceId: string, poweredOn: boolean): Promise<boolean> {
        try {
            const data: string = await PythonUtils.executePython3(WideqAdapter.wideqFolder, WideqAdapter.wideqScriptFile, ['-c ' + this.country, '-l ' + this.language, '-v', 'turn ' + deviceId + ' ' + poweredOn ? 'on': 'off']);
            console.log(data);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    public async setTargetTemperature(deviceId: string, temperatureInCelsius: number): Promise<boolean> {
        try {
            const data: string = await PythonUtils.executePython3(WideqAdapter.wideqFolder, WideqAdapter.wideqScriptFile, ['-c ' + this.country, '-l ' + this.language, '-v', 'set-temp ' + deviceId + ' ' + temperatureInCelsius]);
            console.log(data);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    public async setMode(deviceId: string, mode: Mode): Promise<boolean> {
        try {
            const data: string = await PythonUtils.executePython3(WideqAdapter.wideqFolder, WideqAdapter.wideqScriptFile, ['-c ' + this.country, '-l ' + this.language, '-v', 'set-mode ' + deviceId + ' ' + mode]);
            console.log(data);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    public async setFanSpeed(deviceId: string, fanSpeed: FanSpeed): Promise<boolean> {
        try {
            const data: string = await PythonUtils.executePython3(WideqAdapter.wideqFolder, WideqAdapter.wideqScriptFile, ['-c ' + this.country, '-l ' + this.language, '-v', 'set-speed ' + deviceId + ' ' + fanSpeed]);
            console.log(data);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    public async setSwingModeV(deviceId: string, swingModeV: VSwingMode): Promise<boolean> {
        try {
            const data: string = await PythonUtils.executePython3(WideqAdapter.wideqFolder, WideqAdapter.wideqScriptFile, ['-c ' + this.country, '-l ' + this.language, '-v', 'set-swing-v ' + deviceId + ' ' + swingModeV]);
            console.log(data);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    public async setSwingModeH(deviceId: string, swingModeH: HSwingMode): Promise<boolean> {
        try {
            const data: string = await PythonUtils.executePython3(WideqAdapter.wideqFolder, WideqAdapter.wideqScriptFile, ['-c ' + this.country, '-l ' + this.language, '-v', 'set-swing-h ' + deviceId + ' ' + swingModeH]);
            console.log(data);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    public static fanSpeedToPercentage(fanSpeed: FanSpeed): number {
        switch (fanSpeed) {
            case FanSpeed.SLOW:
                return 12.5;
            case FanSpeed.SLOW_LOW:
                return 25;
            case FanSpeed.LOW:
                return 37.5;
            case FanSpeed.LOW_MID:
                return 50;
            case FanSpeed.MID:
                return 62.5;
            case FanSpeed.MID_HIGH:
                return 75;
            case FanSpeed.HIGH:
                return 87.5;
            case FanSpeed.POWER:
                return 100;

            case FanSpeed.AUTO:
            case FanSpeed.NATURE:
            case FanSpeed.R_LOW:
            case FanSpeed.R_MID:
            case FanSpeed.R_HIGH:
            case FanSpeed.L_LOW:
            case FanSpeed.L_MID:
            case FanSpeed.L_HIGH:
            case FanSpeed.L_LOWR_LOW:
            case FanSpeed.L_LOWR_MID:
            case FanSpeed.L_LOWR_HIGH:
            case FanSpeed.L_MIDR_LOW:
            case FanSpeed.L_MIDR_MID:
            case FanSpeed.L_MIDR_HIGH:
            case FanSpeed.L_HIGHR_LOW:
            case FanSpeed.L_HIGHR_MID:
            case FanSpeed.L_HIGHR_HIGH:
            case FanSpeed.AUTO_2:
            case FanSpeed.POWER_2:
            case FanSpeed.LONGPOWER:
                return 0;
        }
    }

    public static percentageToFanSpeed(percentage: number): FanSpeed {
        if (percentage <= 12.5) {
            return FanSpeed.SLOW;
        } else if (percentage <= 25) {
            return FanSpeed.SLOW_LOW;
        } else if (percentage <= 37.5) {
            return FanSpeed.LOW;
        } else if (percentage <= 50) {
            return FanSpeed.LOW_MID;
        } else if (percentage <= 62.5) {
            return FanSpeed.MID;
        } else if (percentage <= 75) {
            return FanSpeed.MID_HIGH;
        } else if (percentage <= 87.5) {
            return FanSpeed.HIGH;
        } else if (percentage <= 100) {
            return FanSpeed.POWER;
        }
    }
}

export interface AirCooler {
    deviceId: string;
    deviceType: string;
    modelName: string;
    country: string;
    language: string;
}

export interface AirCoolerStatus {
    isOn: boolean
    mode: Mode,
    currentTempInCelsius: number,
    targetTempInCelsius: number,
    fanSpeed: FanSpeed
}

/*
* WIDEQ AC related enums
* Please check ac.py for updated values & documentation
**/

export enum HSwingMode {
    OFF = "OFF",
    ONE = "ONE",
    TWO = "TWO",
    THREE = "THREE",
    FOUR = "FOUR",
    FIVE = "FIVE",
    LEFT_HALF = "LEFT_HALF",
    RIGHT_HALF = "RIGHT_HALF",
    ALL = "ALL",
}

export enum VSwingMode {
    OFF = "OFF",
    ONE = "ONE",
    TWO = "TWO",
    THREE = "THREE",
    FOUR = "FOUR",
    FIVE = "FIVE",
    SIX = "SIX",
    ALL = "ALL"
}

export enum Mode {
    COOL = "COOL",
    DRY = "DRY",
    FAN = "FAN",
    AI = "AI",
    HEAT = "HEAT",

    //TODO: Figure out which mode settings actually work!
    AIRCLEAN = "AIRCLEAN",
    ACO = "ACO",
    AROMA = "AROMA",
    ENERGY_SAVING = "ENERGY_SAVING",
    ENERGY_SAVER = "ENERGY_SAVER",
}

export enum FanSpeed {
    SLOW = 'SLOW',
    SLOW_LOW = 'SLOW_LOW',
    LOW = 'LOW',
    LOW_MID = 'LOW_MID',
    MID = 'MID',
    MID_HIGH = 'MID_HIGH',
    HIGH = 'HIGH',

    //TODO: Figure out which fan speed settings actually work!
    POWER = 'POWER',
    AUTO = 'AUTO',
    NATURE = 'NATURE',
    R_LOW = 'R_LOW',
    R_MID = 'R_MID',
    R_HIGH = 'R_HIGH',
    L_LOW = 'L_LOW',
    L_MID = 'L_MID',
    L_HIGH = 'L_HIGH',
    L_LOWR_LOW = 'L_LOWR_LOW',
    L_LOWR_MID = 'L_LOWR_MID',
    L_LOWR_HIGH = 'L_LOWR_HIGH',
    L_MIDR_LOW = 'L_MIDR_LOW',
    L_MIDR_MID = 'L_MIDR_MID',
    L_MIDR_HIGH = 'L_MIDR_HIGH',
    L_HIGHR_LOW = 'L_HIGHR_LOW',
    L_HIGHR_MID = 'L_HIGHR_MID',
    L_HIGHR_HIGH = 'L_HIGHR_HIGH',
    AUTO_2 = 'AUTO_2',
    POWER_2 = 'POWER_2',
    LONGPOWER = 'LONGPOWER'
}