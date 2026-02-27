import {createInterface} from "readline";
import {CommandParserLite} from "./utility/parser.ts";
import {appendFile, overwriteFile} from "./utility/write-overwrite-file-command.ts";
import {resolveCustomExecResultForCommandArray} from "./utility/resolve-custom-exec-result.ts";
import {listRootAutoCompletions, Trie} from "./utility/trie-util.ts";
import * as test from "node:test";


const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});


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
                // // const testParser = new CommandParserLite('((asd(()((()))())))');
                // // const testParser = new CommandParserLite('  as(d  \'ec( ho\' \'\'\'type\' asd \'  {}  \'   ) ');
                // const testParser = new CommandParserLite('\'\"hello world\"\'');
                //
                // testParser.parse();
                // console.log(testParser.getMaxDepth());
                // console.log(testParser.getOutput());

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
        } else if (splitCommand.length > 1 && (splitCommand.includes('>') || splitCommand.includes('1>'))) {   // внимательно! надо использовать includes вместо indexOf! значение -1 это true в javascript. commandsToPrint.includes('>') || commandsToPrint.includes('1>')
            const index = splitCommand.findIndex(index => index === '>' || index === '1>');

            // splice возвращает то что он удалил!
            // поэтому передавать внутрь функции надо измененный массив в отдельном вызове
            let pathToWriteTo = splitCommand.splice(index);
            pathToWriteTo = pathToWriteTo.splice(1); // избавляемся от символа > или 1>

            const output = await resolveCustomExecResultForCommandArray(splitCommand);

            if (output.error) {
                console.log(output.error);
            }

            // при любом раскладе записываем вывод
            await overwriteFile(pathToWriteTo[0], output.output);

        } else if (splitCommand.length > 1 && splitCommand.includes('2>')) {   // внимательно! надо использовать includes вместо indexOf! значение -1 это true в javascript.
            const index = splitCommand.findIndex(index => index === '2>');
            // splice возвращает то что он удалил!
            // поэтому передавать внутрь функции надо измененный массив в отдельном вызове
            let pathToWriteTo = splitCommand.splice(index);
            pathToWriteTo = pathToWriteTo.splice(1); // избавляемся от символа 2>
            const output = await resolveCustomExecResultForCommandArray(splitCommand);

            // при любом раскладе записываем ошибки. означает ли это что мы должны при любом раскладе записывать и результат в ответвлении выше??
            await overwriteFile(pathToWriteTo[0], output.error.trimEnd());

            if (output.output) {
                console.log(output.output.trimEnd());
            }

        } else if (splitCommand.length > 1 && (splitCommand.includes('>>') || splitCommand.includes('1>>'))) {   // внимательно! надо использовать includes вместо indexOf! значение -1 это true в javascript.
            const index = splitCommand.findIndex(index => index === '>>' || index === '1>>');

            // splice возвращает то что он удалил!
            // поэтому передавать внутрь функции надо измененный массив в отдельном вызове
            let pathToWriteTo = splitCommand.splice(index);
            pathToWriteTo = pathToWriteTo.splice(1); // избавляемся от символа >>

            const output = await resolveCustomExecResultForCommandArray(splitCommand);

            if (output.error) {
                console.log(output.error.trim());
            }

            // при любом раскладе записываем вывод
            await appendFile(pathToWriteTo[0], output.output);

        } else if (splitCommand.length > 1 && splitCommand.includes('2>>')) {   // внимательно! надо использовать includes вместо indexOf! значение -1 это true в javascript.
            const index = splitCommand.findIndex(index => index === '2>>');
            // splice возвращает то что он удалил!
            // поэтому передавать внутрь функции надо измененный массив в отдельном вызове
            let pathToWriteTo = splitCommand.splice(index);
            pathToWriteTo = pathToWriteTo.splice(1); // избавляемся от символа 2>
            const output = await resolveCustomExecResultForCommandArray(splitCommand);

            // при любом раскладе записываем ошибки. означает ли это что мы должны при любом раскладе записывать и результат в ответвлении выше??
            await appendFile(pathToWriteTo[0], output.error.trimEnd());

            if (output.output) {
                console.log(output.output.trimEnd());
            }

        } else {
            const output = await resolveCustomExecResultForCommandArray(splitCommand);

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