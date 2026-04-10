import {createInterface} from "readline";
import {CommandParserLite} from "./utility/parser.ts";
import {appendFile, overwriteFile} from "./utility/write-overwrite-file-command.ts";
import {resolveCustomExecResultForCommandArray} from "./utility/resolve-custom-exec-result.ts";
import {listRootAutoCompletions, Trie} from "./utility/trie-util.ts";
import * as test from "node:test";
import {findAllExecutableNames} from "./utility/fill-trie.ts";


// const rl = createInterface({
//     input: process.stdin,
//     output: process.stdout,
// });
//
//
// async function run() {
//
//     while (true) {
//
//         let command: string = await new Promise(resolve => {
//             rl.question('$ ', resolve);
//         });
//
//         if (command.trim() === 'exit') {
//             rl.close();
//             return; // корректно завершаем функцию
//         }
//
//         command = command.replace(/''+/g, '');
//         command = command.replace(/""+/g, '');
//
//         const parser = new CommandParserLite(command);
//         parser.parse();
//         const splitCommand: string[] = parser.getOutput();
//         // console.log(splitCommand);
//
//         if (splitCommand.length === 1 && splitCommand[0] === 'testcustom') {
//             try {
//                 // const testParser = new CommandParserLite('((asd(()((()))())))');
//                 // const testParser = new CommandParserLite('  as(d  \'ec( ho\' \'\'\'type\' asd \'  {}  \'   ) ');
//                 const testParser = new CommandParserLite('\'\"hello world\"\'');
//
//                 testParser.parse();
//                 console.log(testParser.getMaxDepth());
//                 console.log(testParser.getOutput());
//
//                 let testClass = new Trie();
//                 testClass.insertWord("test");
//                 testClass.insertWord("teso");
//                 testClass.insertWord("cat");
//                 testClass.insertWord("catastrophie");
//                 testClass.insertWord("");
//                 testClass.insertWord("l");
//
//                 console.log(testClass.searchWord("cat"));
//                 console.log(testClass.searchWord("catno"));
//
//
//
//                 console.log("TESTING FUNCTION:", listRootAutoCompletions(testClass));
//
//             } catch (err) {
//                 console.log(`${err}`);
//             }
//         } else if (splitCommand.length > 1 && (splitCommand.includes('>') || splitCommand.includes('1>'))) {   // внимательно! надо использовать includes вместо indexOf! значение -1 это true в javascript. commandsToPrint.includes('>') || commandsToPrint.includes('1>')
//             const index = splitCommand.findIndex(index => index === '>' || index === '1>');
//
//             // splice возвращает то что он удалил!
//             // поэтому передавать внутрь функции надо измененный массив в отдельном вызове
//             let pathToWriteTo = splitCommand.splice(index);
//             pathToWriteTo = pathToWriteTo.splice(1); // избавляемся от символа > или 1>
//
//             const output = await resolveCustomExecResultForCommandArray(splitCommand);
//
//             if (output.error) {
//                 console.log(output.error);
//             }
//
//             // при любом раскладе записываем вывод
//             await overwriteFile(pathToWriteTo[0], output.output);
//
//         } else if (splitCommand.length > 1 && splitCommand.includes('2>')) {   // внимательно! надо использовать includes вместо indexOf! значение -1 это true в javascript.
//             const index = splitCommand.findIndex(index => index === '2>');
//             // splice возвращает то что он удалил!
//             // поэтому передавать внутрь функции надо измененный массив в отдельном вызове
//             let pathToWriteTo = splitCommand.splice(index);
//             pathToWriteTo = pathToWriteTo.splice(1); // избавляемся от символа 2>
//             const output = await resolveCustomExecResultForCommandArray(splitCommand);
//
//             // при любом раскладе записываем ошибки. означает ли это что мы должны при любом раскладе записывать и результат в ответвлении выше??
//             await overwriteFile(pathToWriteTo[0], output.error.trimEnd());
//
//             if (output.output) {
//                 console.log(output.output.trimEnd());
//             }
//
//         } else if (splitCommand.length > 1 && (splitCommand.includes('>>') || splitCommand.includes('1>>'))) {   // внимательно! надо использовать includes вместо indexOf! значение -1 это true в javascript.
//             const index = splitCommand.findIndex(index => index === '>>' || index === '1>>');
//
//             // splice возвращает то что он удалил!
//             // поэтому передавать внутрь функции надо измененный массив в отдельном вызове
//             let pathToWriteTo = splitCommand.splice(index);
//             pathToWriteTo = pathToWriteTo.splice(1); // избавляемся от символа >>
//
//             const output = await resolveCustomExecResultForCommandArray(splitCommand);
//
//             if (output.error) {
//                 console.log(output.error.trim());
//             }
//
//             // при любом раскладе записываем вывод
//             await appendFile(pathToWriteTo[0], output.output);
//
//         } else if (splitCommand.length > 1 && splitCommand.includes('2>>')) {   // внимательно! надо использовать includes вместо indexOf! значение -1 это true в javascript.
//             const index = splitCommand.findIndex(index => index === '2>>');
//             // splice возвращает то что он удалил!
//             // поэтому передавать внутрь функции надо измененный массив в отдельном вызове
//             let pathToWriteTo = splitCommand.splice(index);
//             pathToWriteTo = pathToWriteTo.splice(1); // избавляемся от символа 2>
//             const output = await resolveCustomExecResultForCommandArray(splitCommand);
//
//             // при любом раскладе записываем ошибки. означает ли это что мы должны при любом раскладе записывать и результат в ответвлении выше??
//             await appendFile(pathToWriteTo[0], output.error.trimEnd());
//
//             if (output.output) {
//                 console.log(output.output.trimEnd());
//             }
//
//         } else {
//             const output = await resolveCustomExecResultForCommandArray(splitCommand);
//
//             if (output.error) {
//                 console.log(output.error);
//             } else if (output.output) {
//                 console.log(output.output);
//             }
//         }
//     }
// }
//
// try {
//     await run();
// } catch (e) {
//     console.error(`Error: ${e}`);
// }

// echo "world'hello'\\'test"
// echo "test\"insidequotes"shell\"
// cat /tmp/bee/"number 40" /tmp/bee/"doublequote \" 34" /tmp/bee/"backslash \\ 61"
// cat /tmp/rat/"number 38"
// 'exe  with  space' /tmp/owl/f1
// 'exe  with  space' /tmp/pig/f1
// 'exe with "quotes"'


// //*********************************************************************************************//
// //*********************************************************************************************//

//
// let trieClass = new Trie();
// trieClass.insertWord("echo");
// trieClass.insertWord("exit");
//
// // Для перехвата нажатий клавиш
// const rl = createInterface({
//     input: process.stdin,
//     output: process.stdout,
//     terminal: true // Важно для работы keypress
// });
//
// // Список команд для автодополнения
// //const COMMANDS = ['ls', 'cd', 'pwd', 'exit', 'testcustom', 'mkdir', 'rm'];
//
// // Функция: возвращает подходящие варианты автодополнения
// function getAutocompleteOptions(input: string): string[] {
//     // return COMMANDS.filter(cmd =>
//     //     cmd.toLowerCase().startsWith(input.toLowerCase())
//     // );
//
//     console.log("SENT INPUT", input);
//     const result = trieClass.searchPossibleWords(input);
//     console.log(result);
//     return result;
// }
// // Глобальная переменная для хранения текущего ввода (пока rl.question не поддерживает редактирование)
// let currentInput = '';
//
// // Обработчик нажатия клавиш (для TAB)
// process.stdin.on('keypress', (ch, key) => {
//     if (key.name === 'tab') {
//         const options = getAutocompleteOptions(currentInput);
//         // if (options.length > 0) {
//         //     // Заменяем текущий ввод на первое предложение
//         //     currentInput = options[0];
//         //     // Перерисовываем строку приглашения
//         //     rl.write(null, { ctrl: true, name: 'u' }); // Очищаем строку
//         //     rl.write(`${currentInput}`);
//         // }
//
//         if (options.length > 0) {
//             // Заменяем текущий ввод на первое предложение
//             currentInput = options[0];
//             // Перерисовываем строку приглашения
//             rl.write(null, { ctrl: true, name: 'u' }); // Очищаем строку
//             rl.write(`${currentInput}`);
//         }
//     }
// });
//
// async function run() {
//     while (true) {
//         // Сохраняем текущий ввод перед запросом
//         currentInput = '';
//
//         let command: string = await new Promise(resolve => {
//             rl.question('$ ', (answer) => {
//                 currentInput = answer; // Сохраняем на случай, если TAB сработал до Enter
//                 resolve(answer);
//             });
//         });
//
//         if (command.trim() === 'exit') {
//             rl.close();
//             return;
//         }
//
//         command = command.replace(/''+/g, '');
//         command = command.replace(/""+/g, '');
//
//         const parser = new CommandParserLite(command);
//         parser.parse();
//         const splitCommand: string[] = parser.getOutput();
//
//         if (splitCommand.length === 1 && splitCommand[0] === 'testcustom') {
//             try {
//                 let testClass = new Trie();
//                 testClass.insertWord("test");
//                 testClass.insertWord("teso");
//                 testClass.insertWord("cat");
//                 testClass.insertWord("catastrophie");
//                 testClass.insertWord("");
//                 testClass.insertWord("l");
//
//                 console.log(testClass.searchWord("cat"));
//                 console.log(testClass.searchWord("catno"));
//                 console.log("TESTING FUNCTION:", listRootAutoCompletions(testClass));
//             } catch (err) {
//                 console.log(`${err}`);
//             }
//         } else if (splitCommand.length > 1 && (splitCommand.includes('>') || splitCommand.includes('1>'))) {
//             const index = splitCommand.findIndex(index => index === '>' || index === '1>');
//             let pathToWriteTo = splitCommand.splice(index);
//             pathToWriteTo = pathToWriteTo.splice(1);
//
//             const output = await resolveCustomExecResultForCommandArray(splitCommand);
//             if (output.error) {
//                 console.log(output.error);
//             }
//             await overwriteFile(pathToWriteTo[0], output.output);
//         } else if (splitCommand.length > 1 && splitCommand.includes('2>')) {
//             const index = splitCommand.findIndex(index => index === '2>');
//             let pathToWriteTo = splitCommand.splice(index);
//             pathToWriteTo = pathToWriteTo.splice(1);
//
//             const output = await resolveCustomExecResultForCommandArray(splitCommand);
//             await overwriteFile(pathToWriteTo[0], output.error.trimEnd());
//             if (output.output) {
//                 console.log(output.output.trimEnd());
//             }
//         } else if (splitCommand.length > 1 && (splitCommand.includes('>>') || splitCommand.includes('1>>'))) {
//             const index = splitCommand.findIndex(index => index === '>>' || index === '1>>');
//             let pathToWriteTo = splitCommand.splice(index);
//             pathToWriteTo = pathToWriteTo.splice(1);
//
//             const output = await resolveCustomExecResultForCommandArray(splitCommand);
//             if (output.error) {
//                 console.log(output.error.trim());
//             }
//             await appendFile(pathToWriteTo[0], output.output);
//         } else if (splitCommand.length > 1 && splitCommand.includes('2>>')) {
//             const index = splitCommand.findIndex(index => index === '2>>');
//             let pathToWriteTo = splitCommand.splice(index);
//             pathToWriteTo = pathToWriteTo.splice(1);
//
//             const output = await resolveCustomExecResultForCommandArray(splitCommand);
//             await appendFile(pathToWriteTo[0], output.error.trimEnd());
//             if (output.output) {
//                 console.log(output.output.trimEnd());
//             }
//         } else {
//             const output = await resolveCustomExecResultForCommandArray(splitCommand);
//             if (output.error) {
//                 console.log(output.error);
//             } else if (output.output) {
//                 console.log(output.output);
//             }
//         }
//     }
// }
//
// try {
//     await run();
// } catch (e) {
//     console.error(`Error: ${e}`);
// }


let trieClass = new Trie();
trieClass.insertWord("echo");
trieClass.insertWord("exit");

// const avaliableExecutablesList = await findAllExecutableNames();
// for (const executable of avaliableExecutablesList) {
//     trieClass.insertWord(executable);
// }

function getAutocompleteOptions(input: string): string[] {
    // генерирует массив слов, в которых начало слова соответствует заданному в input
    const result = trieClass.searchPossibleWords(input);

    return result;
}

// глобальный буфер, в котором накапливается строка, необходимо в первую очередь для того чтобы передать команду в обработчик команд целиком при нажатии на enter, а также в обработчик клавиши TAB
let currentInput = '';

function prompt() {
    process.stdout.write('\x1B[2K'); // Очищаем строку
    process.stdout.write('\r$ ');     // Возвращаем курсор в начало
}

// Инициализация: отключаем эхо терминала
process.stdin.setEncoding('utf8');
if (process.stdin.isTTY && process.stdin.setRawMode) {
    try {
        process.stdin.setRawMode(true); // Отключаем обработку терминала
    } catch (e) {
        console.warn('Raw mode not supported');
    }
}

process.stdin.on('data', (data: Buffer) => {
    const input = data.toString();
    // в ряде случаев input может состоять из нескольких символов, т.е. при одном нажати клавиши будет генерироваться несколько символов в 'data'
    for (const char of input) {
        switch (char) {
            case '\t': // Tab
                const options = getAutocompleteOptions(currentInput);
                if (options.length > 0) {
                    currentInput = options[0];
                    prompt();
                    process.stdout.write(currentInput);
                }
                else if(options.length === 0) {
                    process.stdout.write('\x07'); // таким выводом подаем звуковой сигнал, свидетельствующий о том что нет подстановки
                    // currentInput += '\x07';
                }
                break;

            case '\r': // Enter (Windows)
            case '\n': // Enter (Unix)
                process.stdout.write('\n');

                if (currentInput.trim() === 'exit') {
                    process.exit();
                }

                handleCommand(currentInput)
                    .then(() => {
                        currentInput = '';
                        prompt();
                    })
                    .catch(console.error);
                break;

            case '\x7f': // Backspace (Linux/macOS)
            case '\b':   // Backspace (Windows)
                if (currentInput.length > 0) {
                    currentInput = currentInput.slice(0, -1);
                    prompt();
                    process.stdout.write(currentInput);
                }
                break;

            default:
                // Выводим ТОЛЬКО печатные символы (не управляющие)
                if (char >= ' ' && !'\r\n\t\b\x7f'.includes(char)) {
                    currentInput += char;
                    process.stdout.write(char); // <-- ВАЖНО: явно выводим символ
                }
        }
    }
});



// Функция обработки команды
async function handleCommand(command: string) {
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

// Начинаем
prompt();

// process.stdin.setEncoding('utf8');
// process.stdin.setRawMode?(true); // Включаем сырой режим (если доступно)