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
        const data: string = await this.pythonUtils.executePython3(this.wideqScriptFile,['ls', '-c ' + this.country, '-l ' + this.language, '-v']);

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
}

//TODO: Testing only!
setTimeout(async () => {
    const test = new WideqAdapter('BE', 'en-UK');
    const result = await test.listAirCoolers();
    console.log(result);
});

export interface AirCooler {
    deviceId: string;
    deviceType: string;
}