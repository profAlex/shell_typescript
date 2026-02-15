import * as fs from 'fs';


// function to check if the path exists and whether we have access to such a path
async function statPromise(path: string): Promise<fs.Stats> {
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
                // возвращаемся, директория меняться не должна
                return;
            }

            path = homePath;
        }

         await statPromise(path);
    } catch (error) {
        // именно такая реализация по условию задачи, не нужно обрабатывать разные ошибки
        console.log(`cd: ${path}: No such file or directory`);
        return;
    }

    // Блокирующая операция смены директории
    try {
        // данная команда корректно работает и с относительными путями ./ и ../
        process.chdir(path);

        return;

        // Логирование времени блокировки (опционально)
        // console.log(`Смена директории заняла ${Date.now() - startTime} мс`);

        // if (process.cwd() !== path) {
        //     throw new Error('Не удалось сменить директорию');
        // }
    } catch (err) {
        console.log(`cd: ${path}: No such file or directory`);
    }
}