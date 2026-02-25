import * as fs from "node:fs";
import { existsSync } from 'fs';


//
// export async function overwriteFile(filepathAndName: string, dataToWrite: string): Promise<void> {
//     return new Promise((resolve, reject) => {
//         fs.writeFile(filepathAndName, dataToWrite, (err) => {
//                 if (err) {
//                     console.log("ERROR:", err);
//                     reject(err);
//                 }
//             }
//         )
//         resolve();
//     });
// } //вариант через возврат промиса, а также нужен будет колбэк в fs.writeFile

export async function overwriteFile(
    filepathAndName: string,
    dataToWrite: string
): Promise<void> {
    try {
        // console.log("TEST INSIDE:", dataToWrite);
        await fs.promises.writeFile(filepathAndName, dataToWrite);
    } catch (err) {
        console.log("ERROR:", err);
    }
}

export async function appendFile(
    filepathAndName: string,
    dataToWrite: string
): Promise<void> {
    try {
        // Проверяем существование файла, чтобы первая строка не начиналась сразу же с символа /n
        if (existsSync(filepathAndName)) {
            await fs.promises.appendFile(filepathAndName, `\n${dataToWrite}`);
        } else {
            await fs.promises.writeFile(filepathAndName, dataToWrite);
        }
    } catch (err) {
        console.log("ERROR:", err);
    }
}