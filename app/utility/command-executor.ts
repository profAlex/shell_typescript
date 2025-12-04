import { exec } from 'child_process';


type execResult = {
    isSuccessful: boolean;
    returnedStdout?: string;
    returnedStderr: string;
    returnedError?: Error;
};

export async function commandExecuteWIthPromise(commandName :string, params :string[]=[], pathToTheCommand :string) :Promise<execResult> {
    let fullCommand :string = commandName;
    if (params.length > 0) {
        fullCommand = [fullCommand, ...params].join(' ');
    }
    return new Promise((resolve, reject) => {
        exec(fullCommand, {cwd: pathToTheCommand}, (error :Error|null, stdout :string, stderr :string) => {
            if(error){
                resolve({
                    isSuccessful: false,
                    returnedStderr: stderr,
                    returnedError: error
                });
                return;
            }
            resolve({
                isSuccessful: true,
                returnedStderr: stderr,
                returnedStdout: stdout
            });
        });
    });
}