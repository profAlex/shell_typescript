// import fs from 'fs';
// import path from 'path';
//
// /**
//  * Возвращает список всех исполняемых файлов из переменной окружения PATH
//  */
// async function getExecutableFiles(): Promise<string[]> {
//     const executables: string[] = [];
//
//     // 1. Получаем PATH и определяем разделитель (':' для Unix, ';' для Windows)
//     const rawPath = process.env.PATH || '';
//     const delimiter = path.delimiter;
//     const directories = rawPath.split(delimiter);
//
//     // 2. Для Windows нужно учитывать расширения (exe, cmd, bat и т.д.)
//     const isWindows = process.platform === 'win32';
//     const pathExt = isWindows ? (process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM').split(';') : [];
//
//     for (const dir of directories) {
//         try {
//             // Проверка: пустая строка в PATH часто означает текущую директорию
//             const targetDir = dir || '.';
//
//             // Проверяем существование директории и доступ к ней
//             // Используем accessSync, чтобы отсеять несуществующие пути
//             await fs.promises.access(targetDir, fs.constants.R_OK);
//
//             const stats = await fs.promises.stat(targetDir);
//             if (!stats.isDirectory()) continue;
//
//             const files = await fs.promises.readdir(targetDir);
//
//             for (const file of files) {
//                 const filePath = path.join(targetDir, file);
//
//                 try {
//                     // Проверка на исполняемость
//                     if (isWindows) {
//                         const ext = path.extname(file).toUpperCase();
//                         if (pathExt.includes(ext)) {
//                             executables.push(file);
//                         }
//                     } else {
//                         // В Unix проверяем флаг X_OK
//                         await fs.promises.access(filePath, fs.constants.X_OK);
//                         const fileStat = await fs.promises.stat(filePath);
//                         if (fileStat.isFile()) {
//                             executables.push(file);
//                         }
//                     }
//                 } catch {
//                     // Файл не исполняемый или нет доступа — просто пропускаем
//                     continue;
//                 }
//             }
//         } catch {
//             // Директории не существует или нет прав доступа — игнорируем (крайний случай)
//             continue;
//         }
//     }
//
//     // Возвращаем уникальные имена (сет удалит дубликаты, если файлы есть в разных папках)
//     return Array.from(new Set(executables));
// }

import fs from 'fs';
import path from 'path';
import {PathManager} from "./path-manager.ts";

export async function findAllExecutableNames(): Promise<string[]> {
    const executables: string[] = [];
    const directories = PathManager.getAvaliableDirectories();
    const isWindows = process.platform === 'win32';
    const pathExt = isWindows ? (process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM').split(';') : [];

    if (!directories || directories.length < 1) {
        throw new Error("Directories list is empty");
    }

    for (const dir of directories) {
        try {
            // Проверка: пустая строка в PATH часто означает текущую директорию
            const targetDir = dir || '.';

            // Проверяем существование директории и доступ к ней
            // Используем accessSync, чтобы отсеять несуществующие пути
            await fs.promises.access(targetDir, fs.constants.R_OK);

            const stats = await fs.promises.stat(targetDir);
            if (!stats.isDirectory()) continue;

            const files = await fs.promises.readdir(targetDir);

            for (const file of files) {
                const filePath = path.join(targetDir, file);

                try {
                    // Проверка на исполняемость
                    if (isWindows) {
                        const ext = path.extname(file).toUpperCase();
                        if (pathExt.includes(ext)) {
                            executables.push(file);
                        }
                    } else {
                        // В Unix проверяем флаг X_OK
                        await fs.promises.access(filePath, fs.constants.X_OK);
                        const fileStat = await fs.promises.stat(filePath);
                        if (fileStat.isFile()) {
                            executables.push(file);
                        }
                    }
                } catch {
                    // Файл не исполняемый или нет доступа — просто пропускаем
                    continue;
                }
            }
        } catch {
            // Директории не существует или нет прав доступа — игнорируем (крайний случай)
            continue;
        }
    }

    // Возвращаем уникальные имена (сет удалит дубликаты, если файлы есть в разных папках)
    return Array.from(new Set(executables));
}