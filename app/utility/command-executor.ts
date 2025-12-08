import { exec } from 'child_process';
import { dirname } from 'path';
import {CommandParserLite} from "./parser.ts";


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
        // console.log("--- fullCommand DEBUG:", fullCommand);
    }

    // cat '/tmp/pig/f   26' '/tmp/pig/f   17' '/tmp/pig/f   99'
    const additionalParser = new CommandParserLite(fullCommand);
    additionalParser.parse();
    let editedCommand = additionalParser.getOutput();
    // console.log("--- edited command:", editedCommand);
    editedCommand = editedCommand.filter(item => isNaN(Number(item)));
    fullCommand = editedCommand.join(' ~');
    // console.log("--- fullCommand AFTER FILTERING:", fullCommand);

    // statPromise

    return new Promise((resolve, reject) => {
        exec(fullCommand, {cwd: dirname(pathToTheCommand)}, (error :Error|null, stdout :string, stderr :string) => {
            if(error){
                resolve({
                    isSuccessful: false,
                    returnedStderr: stderr,
                    returnedError: error
                });
                // console.log("ERROR");
                return;
            }
            resolve({
                isSuccessful: true,
                returnedStderr: stderr,
                returnedStdout: stdout
            });
            // console.log("RESOLVE");

        });
    });
}