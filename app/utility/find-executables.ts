import {join} from "path";
import {constants, stat} from "fs";
import {promisify} from "util";
import {PathManager} from "./path-manager.ts";
import * as path from "node:path";


const statPromise = promisify(stat);

async function isFileExecutable(filePath: string): Promise<boolean> {
    try {
        const stats = await statPromise(filePath);

        if (!stats.isFile()) {
            return false;
        }

        // const mode = stats.mode;
        // return (
        //     (mode & constants.S_IXUSR) !== 0 || // Для владельца
        //     (mode & constants.S_IXGRP) !== 0 || // Для группы
        //     (mode & constants.S_IXOTH) !== 0    // Для других
        // );
    }
    catch {
        return false;
    }
}

// function getWindowsExecutablePaths(fileName: string): string[] {
//     const extensions = (process.env.PATHEXT || '').split(';');
//     return extensions.map(ext => {
//         const trimmedExt = ext.trim();
//         return trimmedExt === '' ? fileName : fileName + trimmedExt;
//     });
// }


export async function findExecutableInPath(fileName: string): Promise<string | null> {
    const pathDirectories = PathManager.getAvaliableDirectories();
    if (!pathDirectories) {
        throw new Error('Error while getting path directories');
    }
    // проверка ниже представляется какой-то избыточной - мы при вводе названия файла всегда
    // должны по логике указывать и расширение, если подразумевается, что мы работаем в
    // платформе Windows
    // // Для Windows добавляем возможные расширения
    // const fileNames = process.platform === 'win32'
    //     ? getWindowsExecutablePaths(fileName)
    //     : [fileName];

    // здесь теоретически должна быть проверка на то содержится ли допустимое
    // расширение файла для Windows в переданном названии файла 'fileString'
    console.log("COMMAND NAME RECIEVED:", fileName);

    for (const dir of pathDirectories) {
        // const fullPath = join(dir, "\"" + fileName + "\"");
        // const fullPath = join(dir, fileName);
        const fullPath = path.resolve(dir, fileName);
        console.log("FULL PATH TESTED:", fullPath);

        if (await isFileExecutable(fullPath)) {
            return fullPath;
            //    }
        }
    }

    return null;
}