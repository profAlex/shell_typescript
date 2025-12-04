import { createInterface } from "readline";
import { env } from 'process';

import {findExecutableInPath} from "./utility/find-executables.ts";
import {AvaliableCommands} from "./types/avaliable-commands.ts";

import {splitInputCommand} from "./utility/command-manager.ts";


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
        } else {
            console.log(`${command}: command not found`);
        }

        await run();
    });
}

try{
    run();
}
catch(e){
    console.error(e);
}
