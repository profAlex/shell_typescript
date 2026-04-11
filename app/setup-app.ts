import {Trie} from "./utility/trie-util.ts";
import {findAllExecutableNames} from "./utility/find-execs-in-path-env.ts";


export let trieClass = new Trie();

export async function initializeApp() {
    // это два отдельных по ТЗ надо вставлять обязательно дял проверки платформенными тестами
    trieClass.insertWord("echo");
    trieClass.insertWord("exit");

    // здесь с помощью вспомогательной функции находим все возможные исполняемые файлы в PATH
    // и вставляем из в наш класс trie
    const avaliableExecutablesList = await findAllExecutableNames();
    for (const executable of avaliableExecutablesList) {
        trieClass.insertWord(executable);
        // console.log("INSERTED FILE:", executable);
    }
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