// Функция обработки команды из CLI
import {resolveCustomExecResultForCommandArray} from "./resolve-custom-exec-result.ts";
import {CommandParserLite} from "./parser.ts";
import {listRootAutoCompletions, Trie} from "./trie-util.ts";
import {appendFile, overwriteFile} from "./write-overwrite-file-command.ts";

export async function handleCommand(command: string) {
    command = command.replace(/''+/g, '');
    command = command.replace(/""+/g, '');

    const parser = new CommandParserLite(command);
    parser.parse();
    const splitCommand: string[] = parser.getOutput();

    if (splitCommand.length === 1 && splitCommand[0] === 'testcustom') {
        try {
            let testClass = new Trie();
            testClass.insertWord("test");
            testClass.insertWord("teso");
            testClass.insertWord("cat");
            testClass.insertWord("catastrophie");
            testClass.insertWord("");
            testClass.insertWord("l");

            console.log(testClass.searchWord("cat"));
            console.log(testClass.searchWord("catno"));
            console.log("TESTING FUNCTION:", listRootAutoCompletions(testClass));
        } catch (err) {
            console.log(`${err}`);
        }
    } else if (splitCommand.length > 1 && (splitCommand.includes('>') || splitCommand.includes('1>'))) {
        const index = splitCommand.findIndex(index => index === '>' || index === '1>');
        let pathToWriteTo = splitCommand.splice(index);
        pathToWriteTo = pathToWriteTo.splice(1);

        const output = await resolveCustomExecResultForCommandArray(splitCommand);
        if (output.error) {
            // console.log(output.error);
            process.stdout.write(output.error + '\n');

        }
        await overwriteFile(pathToWriteTo[0], output.output);
    } else if (splitCommand.length > 1 && splitCommand.includes('2>')) {
        const index = splitCommand.findIndex(index => index === '2>');
        let pathToWriteTo = splitCommand.splice(index);
        pathToWriteTo = pathToWriteTo.splice(1);

        const output = await resolveCustomExecResultForCommandArray(splitCommand);
        await overwriteFile(pathToWriteTo[0], output.error.trimEnd());
        if (output.output) {
            // console.log(output.output.trimEnd());
            process.stdout.write(output.output.trimEnd() + '\n');

        }
    } else if (splitCommand.length > 1 && (splitCommand.includes('>>') || splitCommand.includes('1>>'))) {
        const index = splitCommand.findIndex(index => index === '>>' || index === '1>>');
        let pathToWriteTo = splitCommand.splice(index);
        pathToWriteTo = pathToWriteTo.splice(1);

        const output = await resolveCustomExecResultForCommandArray(splitCommand);
        if (output.error) {
            // console.log(output.error.trim());
            process.stdout.write(output.error.trim() + '\n');

        }
        await appendFile(pathToWriteTo[0], output.output);
    } else if (splitCommand.length > 1 && splitCommand.includes('2>>')) {
        const index = splitCommand.findIndex(index => index === '2>>');
        let pathToWriteTo = splitCommand.splice(index);
        pathToWriteTo = pathToWriteTo.splice(1);

        const output = await resolveCustomExecResultForCommandArray(splitCommand);
        await appendFile(pathToWriteTo[0], output.error.trimEnd());
        if (output.output) {
            // console.log(output.output.trimEnd());
            process.stdout.write(output.output.trimEnd() + '\n');
        }
    } else {
        const output = await resolveCustomExecResultForCommandArray(splitCommand);
        if (output.error) {
            // console.log(output.error);
            process.stdout.write(output.error + '\n');

        } else if (output.output) {
            //console.log(output.output);
            process.stdout.write(output.output + '\n');
        }
    }
}