import { createInterface } from "readline";
import { env } from 'process';

import {findExecutableInPath} from "./utility/find-executables.ts";
import {AvaliableCommands} from "./types/avaliable-commands.ts";
import {splitInputCommand} from "./utility/raw-command-splitter.ts";
import {commandExecuteWIthPromise} from "./utility/command-executor.ts";
import {chdirWithChecks} from "./utility/cd-command-facilitator.ts";


const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function run() {
    rl.question('$ ', async (command) => {

        if (command.trim() === 'exit') {
            rl.close();
            return;
        }

        const splitCommand = splitInputCommand(command);
        if (splitCommand.length === 1 && splitCommand[0] === 'test') {
            const path = env.PATH;
            console.log(path);
        }
        else if (splitCommand.length > 1 && splitCommand[0] === AvaliableCommands.echo) {
            console.log(splitCommand[1]);
        }
        else if (splitCommand.length > 1 && splitCommand[0] === AvaliableCommands.type) {
            if (splitCommand[1] in AvaliableCommands) {
                console.log(`${splitCommand[1]} is a shell builtin`);
            }
            else if (!(splitCommand[1] in AvaliableCommands)){
                const executableName :string = splitCommand[1];
                const fullPath = await findExecutableInPath(executableName);

                if (fullPath) {
                    console.log(`${executableName} is ${fullPath}`);
                } else {
                    console.log(`${executableName}: not found`);
                }
            }
            else {
                console.log(`${splitCommand[1]}: not found`);
            }
        }
        else if (splitCommand.length !== 0 && splitCommand[0] === AvaliableCommands.pwd) {
            const currentWorkingDirectory = process.cwd();
            console.log(`${currentWorkingDirectory}`);
        }
        else if (splitCommand.length > 1 && splitCommand[0] === AvaliableCommands.cd ) {
            await chdirWithChecks(splitCommand[1]);
        }
        else if (splitCommand.length !== 0) {
            const executableName :string = splitCommand[0];
            const fullPath = await findExecutableInPath(executableName);

            if (fullPath) {
                const args = splitCommand.slice(1);
                const result = await commandExecuteWIthPromise(executableName, args, fullPath);

                const {
                    isSuccessful,
                    returnedStdout,
                    returnedStderr,
                    returnedError
                } = result;

                if (returnedStdout) {
                    process.stdout.write(returnedStdout);
                    // console.log(`${returnedStdout}\r`);
                }
                // TODO: тут еще обработать ошибки из result
            }
            else {
                console.log(`${command}: command not found`);
            }
        }
        else {
            console.log(`${command}: command not found`);
        }

        await run();
    });
}

try{
    run();
}
catch(e){
    console.error(`Error: ${e}`);
}
