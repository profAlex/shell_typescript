import * as fs from "node:fs";

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
        await fs.promises.writeFile(filepathAndName, dataToWrite);
    } catch (err) {
        console.error("ERROR:", err);
    }
}

export async function appendFile(
    filepathAndName: string,
    dataToWrite: string
): Promise<void> {
    try {
        await fs.promises.appendFile(filepathAndName, dataToWrite);
    } catch (err) {
        console.error("ERROR:", err);
    }
}