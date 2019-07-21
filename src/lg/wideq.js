const {spawn} = require('child_process');
const {resolve} = require('path');

module.exports.Wideq = function (country, language) {
    const me = this;

    me.scriptPath = resolve(__dirname + '../../../resources/wideq/example.py');
    me.statePath = resolve(__dirname + '../../../resources/wideq/wideq_state.json');
    console.log('Path to script file: ' + me.scriptPath);
    console.log('Path to state file: ' + me.statePath);

    me.country = country;
    me.language = language;

    me.ls = () => {
        return python('ls')
            .then((result) => {
                return Promise.resolve(parseLs(result));
            });
    };

    me.status = (deviceId) => {
        return python('mon', deviceId)
            .then((result) => {
                return Promise.resolve(parseMon(result));
            });
    };

    me.turnOnOrOff = (deviceId, turnOn) => {
        return python('turn', deviceId, turnOn ? 'on' : 'off')
            .then(() => {
                return Promise.resolve({result: 'success'});
            }).catch((error) => {
                return Promise.reject({result: 'failure', reason: error});
            });
    };

    me.setTemp = (deviceId, targetTemp) => {
        if(targetTemp < 18 || targetTemp > 26) {
            return Promise.reject('Temperature should be between 18 and 26 °C');
        } else {
            return python('set-temp', deviceId, targetTemp)
                .then(() => {
                    return Promise.resolve({result: 'success'});
                }).catch((error) => {
                    return Promise.reject({result: 'failure', reason: error});
                });
        }
    };

    const parseLs = (data) => {
        const devices = data.split('\n');

        const processedDevices = [];
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
    };

    const parseMon = (data) => {
        const monitorLines = data.split('- ');

        const processedMonitorData = {};
        if (monitorLines.length > 1) {
            monitorLines.shift();
            for (const monitorLine of monitorLines) {
                const labelAndValues = monitorLine.split(':');
                if (labelAndValues.length > 1) {
                    const valueAndRange = labelAndValues[1].split('(');
                    if(valueAndRange.length > 1) {
                        processedMonitorData[labelAndValues[0]] = {value: valueAndRange[0].trim(), range: valueAndRange[1].replace(')', '').replace('\n', '').trim()};
                    } else {
                        processedMonitorData[labelAndValues[0]] = {value: valueAndRange[0].replace('\n', '').trim(), range: null};
                    }
                }
            }
        }
        return processedMonitorData;
    };

    const python = (...args) => {
        const pythonArgs = [resolve(
            this.scriptPath),
            '-c ' + this.country,
            '-l ' + this.language,
            '-s' + this.statePath
        ];

        for (const arg of args) {
            pythonArgs.push(arg);
        }

        const pythonProcess = spawn('python3', pythonArgs);

        return new Promise((resolve, reject) => {
            pythonProcess.stdout.on('data', (data) => {
                //console.log(data.toString());
                pythonProcess.kill('SIGTERM');

                resolve(data.toString());
            });
            pythonProcess.on('close', (code) => {
                if(code === 0) {
                    resolve('Succeeded');
                } else {
                    reject('Failed');
                }
            });
            pythonProcess.stderr.on('data', (data) => {
                console.error(data.toString());

                reject(data.toString());
            });
        });
    }
};