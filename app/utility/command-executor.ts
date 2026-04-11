import {exec, execFile} from 'child_process';
import {dirname} from 'path';
import {CommandParserLite} from "./parser.ts";

type execResult = {
    isSuccessful: boolean;
    returnedStdout?: string;
    returnedStderr: string;
    returnedError?: Error;
};

export async function commandExecuteWithPromise(
    commandName: string,
    params: string[] = [],
): Promise<execResult> {
    return new Promise((resolve, reject) => {
        // Экранирование параметров
        // const escapedParams = params.map(str => {
        //     if (str.includes("'")) {
        //         return `"${str}"`;
        //     } else {
        //         return `'${str}'`;
        //     }
        // });

        execFile(
            commandName, // только имя исполняемого файла
            // escapedParams, // массив параметров
            params,
            // { cwd: dirname(pathToTheCommand) },
            (error: Error | null, stdout: string, stderr: string) => {
                if (error) {
                    resolve({
                        isSuccessful: false,
                        returnedStderr: stderr,
                        returnedError: error
                    });
                    return;
                }
                // const trimmedStdout = stdout.trimEnd();
                const trimmedStdout = stdout;

                resolve({
                    isSuccessful: true,
                    returnedStderr: stderr,
                    returnedStdout: trimmedStdout
                });
            }
        );
    });
}