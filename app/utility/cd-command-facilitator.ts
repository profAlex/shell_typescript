import * as fs from 'fs';
import { promisify } from 'util';

// const access = promisify(fs.access);


// function to check if the path exists and whether we have access to such a pass
function statPromise(path: string): Promise<fs.Stats> {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    reject(err);
                    // reject(new Error(`Файл или директория не существует: ${path}`));
                } else if (err.code === 'EACCES') {
                    reject(err);
                    // reject(new Error(`Нет прав доступа к: ${path}`));
                } else {
                    reject(err);
                }
            } else {
                resolve(stats);
            }
        });
    });
}


export async function chdirWithChecks(path: string): Promise<void> {
    // Неблокирующие проверки через fs.access
    try {
        if(path.trim() === '~') {
            const homePath = process.env.HOME ?? undefined;
            if(!homePath || !(typeof homePath === 'string') || !(homePath.trim().length > 0)) {
                // console.log(`cd: couldn't resolve HOME directory for ~ command`);

                return;
            }

            path = homePath;
        }

        // более лайтовый вариант
        // // Проверка существования
        // await access(path, fs.constants.F_OK);
        //
        // // Проверка прав на запись
        // await access(path, fs.constants.W_OK);

        // проверки на наличие прав
        const stats = await statPromise(path);
        // if(!stats.isDirectory()) {
        //     console.log(`cd: ${path}: No such file or directory`);
        //     return;
        // }
    } catch (error) {
        // именно такая реализация по условию задачи
        console.log(`cd: ${path}: No such file or directory`);
        return;

        // throw new Error(`Ошибка проверки директории: ${error}`);
    }

    // Блокирующая операция смены директории
    try {
        // const startTime = Date.now();

        process.chdir(path);

        // Логирование времени блокировки (опционально)
        // console.log(`Смена директории заняла ${Date.now() - startTime} мс`);

        // if (process.cwd() !== path) {
        //     throw new Error('Не удалось сменить директорию');
        // }
    } catch (err) {
        console.log(`cd: ${path}: No such file or directory`);
        // throw new Error(`Error while changing directory path ${path}: ${err}`);
    }
}