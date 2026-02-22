import {createInterface} from "readline";

import {findExecutableInPath} from "./utility/find-executables.ts";
import {AvaliableCommands} from "./types/avaliable-commands.ts";
import {commandExecuteWithPromise} from "./utility/command-executor.ts";
import {chdirWithChecks} from "./utility/cd-command-facilitator.ts";
import {CommandParserLite} from "./utility/parser.ts";
import {overwriteFile} from "./utility/write-overwrite-file-command.ts";
import type {CustomExecResult} from "./types/custom-exec-result.ts";


const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});


async function resolveOutputForCommandArray(splitCommand: string[]): Promise<CustomExecResult> {
    if (splitCommand.length > 1 && splitCommand[0].trim() === AvaliableCommands.echo) {
        const commandsToPrint = splitCommand.slice(1);

        // console.log(commandsToPrint.join(' '));
        return {
            output: commandsToPrint.join(' ')
        } as CustomExecResult;

    } else if (splitCommand.length > 1 && splitCommand[0].trim() === AvaliableCommands.type) {
        if (splitCommand[1] in AvaliableCommands) {
            // console.log(`${splitCommand[1]} is a shell builtin`);
            return {
                output: `${splitCommand[1]} is a shell builtin`
            } as CustomExecResult;

        } else if (!(splitCommand[1] in AvaliableCommands)) {
            const executableName: string = splitCommand[1];
            const fullPath = await findExecutableInPath(executableName);

            if (fullPath) {
                // console.log(`${executableName} is ${fullPath}`);
                return {
                    output: `${executableName} is ${fullPath}`
                } as CustomExecResult;

            } else {
                // console.log(`${executableName}: not found`);
                return {
                    error: `${executableName}: not found`
                } as CustomExecResult;
            }
        } else {
            // console.log(`${splitCommand[1]}: not found`);
            return {
                error: `${splitCommand[1]}: not found`
            } as CustomExecResult;

        }
    } else if (splitCommand.length !== 0 && splitCommand[0].trim() === AvaliableCommands.pwd) {
        const currentWorkingDirectory = process.cwd();
        // console.log(`${currentWorkingDirectory}`);
        return {
            output: `${currentWorkingDirectory}`
        } as CustomExecResult;

    } else if (splitCommand.length > 1 && splitCommand[0].trim() === AvaliableCommands.cd) {
        return {
            output: await chdirWithChecks(splitCommand[1])
        } as CustomExecResult;
    }
        // else if (splitCommand.length === 1 && splitCommand[0] === AvaliableCommands.tilda) {
        //     const homePath = process.env.HOME ?? undefined;
        //
        //     if(homePath && (typeof homePath === 'string') && (homePath.trim().length > 0)) {
        //         await chdirWithChecks(homePath);
        //     }
    // }
        
    // ответвление для обработки невстроенных команд
    else if (splitCommand.length !== 0) {
        const executableName: string = splitCommand[0];

        const fullPath = await findExecutableInPath(executableName);
        // в переменной храним промежуточный результат
        let preliminaryResult: string = "";
        // если будет найдена ошибка - она будет здесь и возвращать будем именно ее по заданной нам логике
        let errorResult: string = "";

        // реализация для невстроенных команд, состоящих из единственного названия команды
        if (fullPath && splitCommand.length === 1) {
            try {
                const result = await commandExecuteWithPromise(executableName, []);

                const {
                    isSuccessful,
                    returnedStdout,
                    returnedStderr,
                    returnedError
                } = result;

                // ошибки не обрабатываем, т.к. это мешает прохождению некоторых автотестов на платформе
                if (!isSuccessful) {
                    // console.log(`${trimmedStderr}`);
                    // return undefined;
                    errorResult = returnedStderr.trimEnd();
                }

                if (returnedStdout) {
                    // process.stdout.write(returnedStdout);
                    // console.log("TEST:",returnedStdout);
                    // return returnedStdout;
                    preliminaryResult += returnedStdout;
                }
            } catch (err) {
                console.log(`UNEXPECTED ERROR: ${err} inside resolveOutputForCommandArray -> commandExecuteWithPromise(executableName, [arg])`);
            }

            return {
                output: preliminaryResult,
                error: errorResult
            } as CustomExecResult;
        }
        // отдельная реализация для невстроенных команд, отличных от 'cat' и имеющих параметры
        else if (fullPath && splitCommand.length > 1 && splitCommand[0].trim() !== 'cat')
        {
            const args = splitCommand.slice(1);

            try {
                const result = await commandExecuteWithPromise(executableName, args);

                const {
                    isSuccessful,
                    returnedStdout,
                    returnedStderr,
                    returnedError
                } = result;

                // ошибки не обрабатываем, т.к. это мешает прохождению некоторых автотестов на платформе
                if (!isSuccessful) {
                    // console.log(`${trimmedStderr}`);
                    // return undefined;
                    errorResult = returnedStderr.trimEnd();
                }

                if (returnedStdout) {
                    // process.stdout.write(returnedStdout);
                    // console.log("TEST:",returnedStdout);
                    // return returnedStdout;
                    preliminaryResult += returnedStdout;
                }
            } catch (err) {
                console.log(`UNEXPECTED ERROR: ${err} inside resolveOutputForCommandArray -> commandExecuteWithPromise(executableName, [arg])`);
            }

            return {
                output: preliminaryResult,
                error: errorResult
            } as CustomExecResult;
        }
        // отдельная реализация для команды 'cat'
        else if (fullPath && splitCommand.length > 1 && splitCommand[0].trim() === 'cat') {
            const args = splitCommand.slice(1);
            // обрабатываем аргументы по-одному, т.к. если находится ошибка, то результат по переданным валидным - потеряется и выведется только ошибка

            for (const arg of args) {
                try {
                    const result = await commandExecuteWithPromise(executableName, [arg]);

                    const {
                        isSuccessful,
                        returnedStdout,
                        returnedStderr,
                        returnedError
                    } = result;

                    // ошибки не обрабатываем, т.к. это мешает прохождению некоторых автотестов на платформе
                    if (!isSuccessful) {
                        // console.log(`${trimmedStderr}`);
                        // return undefined;
                        errorResult = returnedStderr.trimEnd();
                    }

                    if (returnedStdout) {
                        // process.stdout.write(returnedStdout);
                        // console.log("TEST:",returnedStdout);
                        // return returnedStdout;
                        preliminaryResult += returnedStdout;
                    }
                } catch (err) {
                    console.log(`UNEXPECTED ERROR: ${err} inside resolveOutputForCommandArray -> commandExecuteWithPromise(executableName, [arg])`);
                }
            }

            return {
                output: preliminaryResult,
                error: errorResult
            } as CustomExecResult;

            // TODO: тут еще обработать ошибки из result (на случай когда и если они появятся)
        } else {
            // console.log(`${splitCommand[0]}: command not found`);
            return {
                error: `${splitCommand[0]}: command not found`
            } as CustomExecResult;

        }
    } else {
        // console.log(`${splitCommand[0]}: command not found`);
        return {
            error: `${splitCommand[0]}: command not found`
        } as CustomExecResult;
    }
}


async function run() {

    while (true) {

        let command: string = await new Promise(resolve => {
            rl.question('$ ', resolve);
        });

        if (command.trim() === 'exit') {
            rl.close();
            return; // корректно завершаем функцию
        }

        command = command.replace(/''+/g, '');
        command = command.replace(/""+/g, '');

        const parser = new CommandParserLite(command);
        parser.parse();
        const splitCommand: string[] = parser.getOutput();
        // console.log(splitCommand);

        if (splitCommand.length === 1 && splitCommand[0] === 'testcustom') {
            try {
                // const testParser = new CommandParserLite('((asd(()((()))())))');
                // const testParser = new CommandParserLite('  as(d  \'ec( ho\' \'\'\'type\' asd \'  {}  \'   ) ');
                const testParser = new CommandParserLite('\'\"hello world\"\'');


                testParser.parse();
                console.log(testParser.getMaxDepth());
                console.log(testParser.getOutput());
            } catch (err) {
                console.log(`${err}`);
            }
        } else if (splitCommand.length > 1 && (splitCommand.includes('>') || splitCommand.includes('1>'))) {   // внимательно! надо использовать includes вместо indexOf! значение -1 это true в javascript. commandsToPrint.includes('>') || commandsToPrint.includes('1>') без явного
            const index = splitCommand.findIndex(index => index === '>' || index === '1>');
            // splice возвращает то что он удалил!
            // поэтому передавать внутрь функции надо измененный массив в отдельном вызове
            let pathToWriteTo = splitCommand.splice(index);
            pathToWriteTo = pathToWriteTo.splice(1); // избавляемся от символа > или 1>
            const output = await resolveOutputForCommandArray(splitCommand);

            if (output.error)
            {
                console.error(output.error);
            }

            if (output.output) {
                await overwriteFile(pathToWriteTo[0], output.output);
            }

        } else {
            const output = await resolveOutputForCommandArray(splitCommand);

            if (output.error) {
                console.log(output.error);
            } else if (output.output) {
                console.log(output.output);
            }
        }
    }
}

try {
    await run();
} catch (e) {
    console.error(`Error: ${e}`);
}
// echo "world'hello'\\'test"
// echo "test\"insidequotes"shell\"
// cat /tmp/bee/"number 40" /tmp/bee/"doublequote \" 34" /tmp/bee/"backslash \\ 61"
// cat /tmp/rat/"number 38"
// 'exe  with  space' /tmp/owl/f1
// 'exe  with  space' /tmp/pig/f1
// 'exe with "quotes"'