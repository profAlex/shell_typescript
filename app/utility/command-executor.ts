import { exec } from 'child_process';
import { dirname } from 'path';
import {CommandParserLite} from "./parser.ts";


type execResult = {
    isSuccessful: boolean;
    returnedStdout?: string;
    returnedStderr: string;
    returnedError?: Error;
};

export async function commandExecuteWithPromise(commandName :string, params :string[]=[], pathToTheCommand :string) :Promise<execResult> {
    let fullCommand :string = commandName;

    if (params.length > 0) {
        let fullCommandArray = [...params];

        // Если строка содержит " внутри, их нужно экранировать:
        // str.includes("'") ? `"${str.replace(/"/g, '\\"')}"` : `'${str}'`
        // Но в большинстве случаев (особенно для путей к файлам) это не требуется.
        fullCommandArray = fullCommandArray.map(str => {
            if (str.includes("'")) {
                return `"${str}"`;
            } else {
                return `'${str}'`;
            }
        });

        fullCommand = [fullCommand, ...fullCommandArray].join(' ');

        // console.log("--- fullCommand DEBUG:", fullCommand);
    }

    return new Promise((resolve, reject) => {
        exec(fullCommand, {cwd: dirname(pathToTheCommand)}, (error :Error|null, stdout :string, stderr :string) => {
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