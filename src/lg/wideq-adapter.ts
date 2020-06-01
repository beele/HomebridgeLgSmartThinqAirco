import {PythonUtils} from "../utils/python-utils";

const {resolve} = require('path');

export class WideqAdapter {

    private readonly wideqFolder: string;
    private readonly wideqScriptFile: string;
    private readonly wideqPersistantState: string;

    private readonly pythonUtils: PythonUtils;

    private readonly country: string;
    private readonly language: string;

    constructor(country: string, language: string) {
        this.wideqFolder = resolve(__dirname + '../../../resources/wideq/');
        this.wideqScriptFile = 'example.py';
        this.wideqPersistantState = 'wideq_state.json';

        this.pythonUtils = new PythonUtils(this.wideqFolder);

        this.country = country;
        this.language = language;
    }

    public async listAirCoolers(): Promise<Array<AirCooler>> {
        const data: string = await this.pythonUtils.executePython3(this.wideqScriptFile, ['-c ' + this.country, '-l ' + this.language, '-v', 'ls']);

        const devices = data.split('\n');

        const processedDevices: AirCooler[] = [];
        for (const device of devices) {
            const devicePieces1 = device.split(':');

            if (devicePieces1.length > 1) {
                const devicePieces2 = devicePieces1[1].split('(');

                const deviceId = devicePieces1[0].trim();
                const deviceType = devicePieces2[0].trim();
                processedDevices.push({deviceId, deviceType});
            }
        }

        return processedDevices;
    }

    public async getStatus(): Promise<AirCoolerStatus> {
        return null;
    }

    public async setPowerOnOff(deviceId: string, poweredOn: boolean): Promise<boolean> {
        return false;
    }

    public async setTargetTemperature(deviceId: string, temperatureInCelcius: number): Promise<boolean> {
        return false;
    }

    public async setMode(deviceId: string, mode: Mode): Promise<boolean> {
        try {
            const data: string = await this.pythonUtils.executePython3(this.wideqScriptFile, ['-c ' + this.country, '-l ' + this.language, '-v', 'set-mode ' + deviceId + ' ' + mode]);
            console.log(data);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    public async setFanSpeed(deviceId: string, fanSpeed: FanSpeed): Promise<boolean> {
        return false;
    }

    public async setSwingModeV(deviceId: string, swingModeV: VSwingMode): Promise<boolean> {
        try {
            const data: string = await this.pythonUtils.executePython3(this.wideqScriptFile, ['-c ' + this.country, '-l ' + this.language, '-v', 'set-swing-v ' + deviceId + ' ' + swingModeV]);
            console.log(data);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    public async setSwingModeH(deviceId: string, swingModeH: HSwingMode): Promise<boolean> {
        try {
            const data: string = await this.pythonUtils.executePython3(this.wideqScriptFile, ['-c ' + this.country, '-l ' + this.language, '-v', 'set-swing-h ' + deviceId + ' ' + swingModeH]);
            console.log(data);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}

//TODO: Testing only!
setTimeout(async () => {
    const testAdapter = new WideqAdapter('BE', 'en-UK');
    const airCoolers: AirCooler[] = await testAdapter.listAirCoolers();
    const airCooler: AirCooler = airCoolers[0];
    console.log(airCooler);
    const status: AirCoolerStatus = await testAdapter.getStatus();
    console.log(status);

    const sleep = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    let success: boolean = false;
    //success = await testAdapter.setMode(airCooler.deviceId, Mode.COOL);
    success = await testAdapter.setSwingModeV(airCooler.deviceId, VSwingMode.ONE);
    console.log(success);
    await sleep(2500);
    success = await testAdapter.setSwingModeH(airCooler.deviceId, HSwingMode.ONE);
    console.log(success);
});

export interface AirCooler {
    deviceId: string;
    deviceType: string;
}

export interface AirCoolerStatus {

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