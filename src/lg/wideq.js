const exec = require('child_process').exec;
const {resolve} = require('path');

function Wideq(country, language) {
    const me = this;

    me.wideqPath = resolve(__dirname + '../../../resources/wideq/');
    me.scriptPath = resolve(__dirname + '../../../resources/wideq/example.py');
    me.statePath = resolve(__dirname + '../../../resources/wideq/wideq_state.json');
    console.log('Path to script file: ' + me.scriptPath);
    console.log('Path to state file: ' + me.statePath);

    me.country = country;
    me.language = language;

    me.ls = () => {
        return python(['ls'])
            .then((result) => {
                return Promise.resolve(parseLs(result));
            });
    };

    me.status = (deviceId) => {
        return python(['ac-mon', deviceId], true)
            .then((result) => {
                return Promise.resolve(parseMon(result));
            })
            .catch((error) => {
                return Promise.reject(error);
            });
    };

    me.config = (deviceId) => {
        return python(['ac-config', deviceId])
            .then((result) => {
                return Promise.resolve(result);
            })
            .catch((error) => {
                return Promise.reject(error);
            })
    };

    me.turnOnOrOff = (deviceId, turnOn) => {
        return python(['turn', deviceId, turnOn ? 'on' : 'off'])
            .then(() => {
                return Promise.resolve({result: 'success'});
            }).catch((error) => {
                return Promise.reject({result: 'failure', reason: error});
            });
    };

    me.setTemp = (deviceId, targetTemp) => {
        if (targetTemp < 18 || targetTemp > 26) {
            return Promise.reject('Temperature should be between 18 and 26 °C');
        } else {
            return python(['set-temp', deviceId, targetTemp])
                .then(() => {
                    return Promise.resolve({result: 'success'});
                }).catch((error) => {
                    return Promise.reject({result: 'failure', reason: error});
                });
        }
    };

    me.setSpeed = (deviceId, targetSpeed) => {
        if (targetSpeed < 37.5 || targetSpeed > 87.5) {
            return Promise.reject('Fan speed should be between 37.5 and 87.5 %');
        } else {
            return python(['set_speed', deviceId, targetSpeed])
                .then(() => {
                    return Promise.resolve({result: 'success'});
                }).catch((error) => {
                    return Promise.reject({result: 'failure', reason: error});
                });
        }
    };

    me.paramConversion = {
        getSpeedAsNumber: (speed) => {
            switch (speed) {
                case 'SLOW':
                    return 12.5;
                case 'SLOW_LOW':
                    return 25;
                case 'LOW':
                    return 37.5;
                case 'LOW_MID':
                    return 50;
                case 'MID':
                    return 62.5;
                case 'MID_HIGH':
                    return 75;
                case 'HIGH':
                    return 87.5;
                case 'POWER':
                    return 100;
                default:
                    console.log('Unknown value: ' + JSON.stringify(speed, null, 4));
            }
        },
        isOn: (state) => {
            return state === 'on';
        },
        isCooling: (state) => {
            return state === 'COOL';
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
        const dataPieces = data.split(';').map(s => s.trim());
        console.log(dataPieces);
        return {
            onOff: dataPieces[0],
            mode: dataPieces[1],
            currentTemp: dataPieces[2].substring(4),
            targetTemp: dataPieces[3].substring(4),
            speed: dataPieces[4].substring(10)
        };
    };

    const python = (args, forceClose = false) => {
        const pythonArgs = [
            '-c ' + this.country,
            '-l ' + this.language,
            '-v'
        ];

        for (const arg of args) {
            pythonArgs.push(arg);
        }

        return new Promise((resolve, reject) => {
            let data = [];

            console.log('python3 -u example.py ' + pythonArgs.join(' '));
            const process = exec('python3 -u example.py ' + pythonArgs.join(' '), {cwd: this.wideqPath}, (error) => {
                if (error) {
                    console.error(error);
                    reject(error);
                }
            });

            process.stdout.on('data', (output) => {
                console.log(output.toString());
                data.push(output.toString());
                if (forceClose) {
                    process.kill("SIGINT");
                }
            });

            process.stderr.on('data', (output) => {
                console.error(output.toString());
                //This is not always an error, could just be debug info!
            });

            process.on('close', (exitCode) => {
                if (exitCode === 0) {
                    resolve(data.join('\n'));
                } else {
                    reject('python error!')
                }
            });
        });
    }
}

const wideq = new Wideq('BE', 'en-UK');

setTimeout(async () => {
    let results = await wideq.ls();
    console.log(results);

    const deviceId = results[0].deviceId;

    results = await wideq.config(deviceId);
    console.log(results);

    results = await wideq.status(deviceId);
    console.log(results);
});
