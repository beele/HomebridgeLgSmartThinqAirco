const exec = require('child_process').exec;

export class PythonUtils {

    private readonly workingdDir: string;

    constructor(workingDir: string) {
        this.workingdDir = workingDir;
    }

    public async executePython3(scriptName: string, args: string[], forceCloseProcessAfterOutput: boolean = false): Promise<string> {
        const pythonArgs: string[] = [];
        for (const arg of args) {
            pythonArgs.push(arg);
        }

        return new Promise((resolve, reject) => {
            let data: string[] = [];

            console.log('python3 -u example.py ' + pythonArgs.join(' '));
            const process = exec('python3 -u example.py ' + pythonArgs.join(' '), {cwd: this.workingdDir}, (error: any) => {
                if (error) {
                    console.error(error);
                    reject(error);
                }
            });

            process.stdout.on('data', (output: any) => {
                console.log(output.toString());
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