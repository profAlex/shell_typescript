import { createInterface } from "readline";
import { env } from 'process';

import { stat, constants } from 'fs';
import { promisify } from 'util';
import { join } from 'path';

const statPromise = promisify(stat);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

enum AvaliableCommands {
    echo = 'echo',
    exit = 'exit',
    type = 'type',
}

function SplitInputCommand(commandInput: string) :string[] {
    const index = commandInput.trim().indexOf(' ');
    if (index !== -1)
    {
        return [commandInput.trim().slice(0, index), commandInput.trim().slice(index + 1)];
    }

    return [commandInput.trim()];
}

// console.log(env.PATH);


class PathManager {
    private static getSeparator(): string {
        return process.platform === 'win32' ? ';' : ':';
    }

    static addDirectory(directory: string): void {
        const separator = this.getSeparator();
        process.env.PATH = process.env.PATH + separator + directory;
    }

    static removeDirectory(directory: string): void {
        const separator = this.getSeparator();
        const pathArray = process.env.PATH?.split(separator) || [];
        const filteredPath = pathArray.filter(dir => dir !== directory);
        process.env.PATH = filteredPath.join(separator);
    }

    static hasDirectory(directory: string): boolean {
        const separator = this.getSeparator();
        const pathArray = process.env.PATH?.split(separator) || [];
        return pathArray.includes(directory);
    }
}



async function isExecutable(filePath: string): Promise<boolean> {
    try {
        const stats = await statPromise(filePath);

        if (!stats.isFile()) {
            return false;
        }

        const mode = stats.mode;
        return (
            (mode & constants.S_IXUSR) !== 0 || // Для владельца
            (mode & constants.S_IXGRP) !== 0 || // Для группы
            (mode & constants.S_IXOTH) !== 0    // Для других
        );
    }
    catch {
        return false;
    }
}

async function findExecutableInPath(fileName: string): Promise<string | null> {
    const pathDirectories = env.PATH?.split(process.platform === 'win32' ? ';' : ':') || [];

    for (const dir of pathDirectories) {
        const fullPath = join(dir, fileName);
        if (await isExecutable(fullPath)) {
            return fullPath;
        }
    }

    return null;
}

async function run() {

    rl.question('$ ', async (command) => {

        const trimmedCommand = command.trim();
        if (trimmedCommand === 'exit') {
            rl.close();
            // console.log("Exited...");
            return;
        }


        const splitCommand = SplitInputCommand(command);

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

run();