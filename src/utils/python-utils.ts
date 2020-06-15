const {spawn} = require('child_process');

export class PythonUtils {

    public static logDebug: Function;
    
    public static async executePython3(workingDir: string, scriptName: string, args: string[], forceCloseProcessAfterOutput: boolean = false): Promise<string> {
        const pythonArgs: string[] = [];
        for (const arg of args) {
            if(arg) {
                pythonArgs.push(arg.trim());
            }
        }

        return new Promise((resolve, reject) => {
            let data: string[] = [];

            this.logDebug('python3 -u example.py ' + pythonArgs.join(' '));
            const process = spawn('python3', ['-u', 'example.py'].concat(pythonArgs), {cwd: workingDir});

            process.stdout.on('data', (output: any) => {
                this.logDebug(output.toString());
                data.push(output.toString());
                if (forceCloseProcessAfterOutput) {
                    process.kill("SIGINT");
                }
            });

            process.stderr.on('data', (output: any) => {
                console.error(output.toString());
                //This is not always an error, could just be debug info!
            });

            process.on('close', (exitCode: number) => {
                if (exitCode === 0) {
                    resolve(data.join('\n'));
                } else {
                    reject('python error!')
                }
            });
        });
    }
}