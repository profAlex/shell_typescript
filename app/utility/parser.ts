const MAX_INPUT_LENGTH = 400;

// const delimiters = new Set([' ', '{', '}', '(', ')', '\'']);
const delimiters = new Set([' ']);

export class CommandParserLite {
    private input: string;
    private tempDepth: number;
    private maxDepth: number;
    private pos: number;
    private output: string[];
    private inputLength: number;

    // токены (или отдельные команды) разделяются пробелом (см.delimiters), кроме случаев, когда пробел внутри двойных или одинарных кавычек
    // в противном случае распознанное выражение-токен (единичный субъект, который может быть передан в виде аргумента в функцию или выведен на экран)
    // накапливается в этой переменной, и записывается в массив this.output уже как отдельный токен либо
    // когда мы встречаем пробел за пределами обработки кавычек-команды. либо когда мы заканчиваем обрабатываеть команду
    private tempTokenStorage: string;


    constructor(input: string) {
        if (input.length > MAX_INPUT_LENGTH) {
            throw new Error(`Input must be less than ${MAX_INPUT_LENGTH} symbols`);
        }

        this.input = input.trim();
        this.maxDepth = 0;
        this.tempDepth = 0;
        this.pos = 0;
        this.output = [];
        this.inputLength = input.trim().length;
        this.tempTokenStorage = '';
    }

    public parse(): void {
        this.parseExpression('');
        // console.log(this.tempDepth);
        if (this.tempDepth > 0) {
            throw new Error('It seems that expression has incorrect bracket sequence')
        }
    }

    private parseInsideSingleQuotes(): void {
        let tempStringInsideQuotes: string = '';
        while (this.input[this.pos] !== '\'' && this.pos < this.inputLength) {
            // if(this.input[this.pos] === '\\')
            //     this.pos += 1;
            tempStringInsideQuotes += this.input[this.pos];
            this.pos += 1;
        }

        if (this.input[(this.pos)] === '\'' && tempStringInsideQuotes.length !== 0) {
            // this.output.push(tempStringInsideQuotes);
            this.tempTokenStorage += tempStringInsideQuotes;
        }

        if (this.input[(this.pos)] !== '\'') {
            throw new Error('Incorrect single quote sequence')
        }

        this.pos += 1;
        return;
    }


    private parseInsideDoubleQuotes(): void {
        let tempStringInsideQuotes: string = '';
        // символ " не требует экранирования символом \ когда мы рассматриваем его как отдельный символ
        // но при этом символ \ в любом случае надо экранировать: '\\' или "\\"
        while (this.input[this.pos] !== '"' && this.pos < this.inputLength) {

            // этот блок if нужен для учета требования:
            //
            // \": escapes double quote, allowing " to appear literally within the quoted string.
            // \\: escapes backslash, resulting in a literal \.
            if (this.input[this.pos] === '\\'
                && this.pos < (this.inputLength - 1)
                && (this.input[this.pos + 1] === '"' || this.input[this.pos + 1] === '\\')) {
                this.pos += 1;
            }

            tempStringInsideQuotes += this.input[this.pos];
            this.pos += 1;
        }

        if (this.input[(this.pos)] === '"' && tempStringInsideQuotes.length !== 0) {
            this.tempTokenStorage += tempStringInsideQuotes;
        }

        if (this.input[(this.pos)] !== '"') {
            throw new Error('Incorrect double quote sequence')
        }

        this.pos += 1;
        return;
    }

    private parseInsideCommand(): void {
        let tempStringInsideCommand: string = '';
        while (!delimiters.has(this.input[this.pos]) && this.pos < this.inputLength) {
            if (this.input[this.pos] === '\\' && (this.pos + 1) < this.inputLength) {
                this.pos += 1;

                tempStringInsideCommand += this.input[this.pos];
                this.pos += 1;
            }

            // если попадаем на кавычку внутри обработчика команды, то ее надо обработать отдельно, т.к. правила на парсинг внутри двойных кавычек
            // для команды или пути отличаются от обычного
            // например для команды cat: /tmp/ant/"number 89" послать на исполнение надо: cat /tmp/ant/number 89
            else if (this.input[this.pos] === '"') {
                // tempStringInsideCommand += this.input[this.pos];
                this.pos += 1;

                let tempStringInsideQuotes: string = '';
                // символ " не требует экранирования символом \ когда мы рассматриваем его как отдельный символ
                // но при этом символ \ в любом случае надо экранировать: '\\' или "\\"
                while (this.input[this.pos] !== '"' && this.pos < this.inputLength) {

                    // этот блок if нужен для учета требования:
                    //
                    // \": escapes double quote, allowing " to appear literally within the quoted string.
                    // \\: escapes backslash, resulting in a literal \.
                    if (this.input[this.pos] === '\\'
                        && this.pos < (this.inputLength - 1)
                        && (this.input[this.pos + 1] === '"' || this.input[this.pos + 1] === '\\')) {
                        this.pos += 1;
                    }

                    tempStringInsideQuotes += this.input[this.pos];
                    this.pos += 1;
                }

                if (this.input[(this.pos)] === '"' && tempStringInsideQuotes.length !== 0) {
                    tempStringInsideCommand += tempStringInsideQuotes; // объединяем все то что было до начала кавычек и то что внутри с учетом правил парсинга внутри кавычек
                }

                if (this.input[(this.pos)] !== '"') {
                    throw new Error('Incorrect double quote sequence')
                }
                this.pos += 1;
            } else if (this.input[this.pos] === '\'') {
                this.pos += 1;

                let tempStringInsideQuotes: string = '';
                // символ ' требует экранирования символом \ когда мы рассматриваем его как отдельный символ
                while (this.input[this.pos] !== '\'' && this.pos < this.inputLength) {

                    // Backslashes have no special escaping behavior inside single quotes. Every character (including backslashes) within single quotes is treated literally.
                    tempStringInsideQuotes += this.input[this.pos];
                    this.pos += 1;
                }

                if (this.input[(this.pos)] === '\'' && tempStringInsideQuotes.length !== 0) {
                    tempStringInsideCommand += tempStringInsideQuotes; // объединяем все то что было до начала кавычек и то что внутри с учетом правил парсинга внутри кавычек
                }

                if (this.input[(this.pos)] !== '\'') {
                    throw new Error('Incorrect single quote sequence')
                }
                this.pos += 1;
            } else {
                tempStringInsideCommand += this.input[this.pos];
                this.pos += 1;
            }
        }

        if (tempStringInsideCommand.length !== 0) {
            this.tempTokenStorage += tempStringInsideCommand;
            this.output.push(this.tempTokenStorage);
            this.tempTokenStorage = '';
        }

        return;
    }


    //TODO: здесь еще есть простор для оптимизации - каждый case с обычными и фигурными скобками
    // неверное можно обрабатывать в отдельном подметоде, который сам себя вызывает рекурсивно
    // что будет выглядеть опрятнее, наверное
    private parseExpression(sentClosureBracketType: string): void {
        // this variable gives us a flag when we will have to exit current instance of parseExpression call
        let closureBracketType = sentClosureBracketType;

        while (this.pos < this.inputLength) {
            switch ((this.input)[this.pos]) {
                // только в одном случае мы можем наткнуться на такой кейс, когда у нас начинается считывание новой команды, в остальных случаях этот символ встретится либо
                case '\\':
                    this.parseInsideCommand();

                    break;
                case '(':
                    // closureBracketType = 1;
                    this.pos += 1;
                    this.tempDepth += 1;

                    if (this.tempDepth > MAX_INPUT_LENGTH / 2) {
                        throw new Error("Превышена максимальная глубина вложенности");
                    }

                    if (this.tempDepth > this.maxDepth) {
                        this.maxDepth = this.tempDepth;
                    }

                    this.parseExpression('(');

                    break;
                case ')':
                    if (closureBracketType !== '(') {
                        throw (new Error(`Incorrect ')' position`));
                    }
                    if (closureBracketType === '(' && this.tempDepth === 0) {
                        throw (new Error(`Incorrect ')' position`));
                    }
                    this.tempDepth -= 1;
                    this.pos += 1;

                    return;
                case '{':
                    this.pos += 1;
                    this.tempDepth += 1;

                    if (this.tempDepth > MAX_INPUT_LENGTH / 2) {
                        throw new Error("Превышена максимальная глубина вложенности");
                    }

                    if (this.tempDepth > this.maxDepth) {
                        this.maxDepth = this.tempDepth;
                    }

                    this.parseExpression('{');

                    break;
                case '}':
                    if (closureBracketType !== '{') {
                        throw (new Error(`Incorrect '}' position`));
                    }
                    if (closureBracketType === '{' && this.tempDepth === 0) {
                        throw (new Error(`Incorrect '}' position`));
                    }
                    this.tempDepth -= 1;
                    this.pos += 1;

                    return;
                case '\'':
                    this.pos += 1;
                    this.parseInsideSingleQuotes();

                    break;
                case '\"':
                    this.pos += 1;
                    this.parseInsideDoubleQuotes();

                    break;
                case ' ':
                    if (this.tempTokenStorage.length !== 0) {
                        this.output.push(this.tempTokenStorage);
                        this.tempTokenStorage = '';
                    }

                    this.pos += 1;
                    break;
                default:
                    this.parseInsideCommand();

                    break;
            }
        }
        if (this.tempTokenStorage.length !== 0) {
            this.output.push(this.tempTokenStorage);
            this.tempTokenStorage = '';
        }
    }

    public getMaxDepth() {
        return this.maxDepth;
    }

    public getOutput(): string[] {
        // if (this.output[0] === ' ') {
        //     console.log(`0 elem: ${this.output[0]}`);
        //     this.output.shift();
        // }
        //
        // if (this.output[this.output.length-1] === ' ') {
        //     console.log(`last elem: ${this.output[this.output.length-1]}`);
        //
        //     this.output.pop();
        // }

        return this.output;
    }
}