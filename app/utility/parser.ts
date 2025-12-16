const MAX_INPUT_LENGTH = 400;

const delimeters = new Set([' ', '{', '}', '(', ')', '\'']);

export class CommandParserLite {
    private input: string;
    private tempDepth: number;
    private maxDepth: number;
    private pos: number;
    private output: string[];
    private inputLength: number;



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
    }

    public parse():void {
        this.parseExpression('');
        // console.log(this.tempDepth);
        if(this.tempDepth > 0)
        {
            throw new Error('Incorrect bracket sequence')
        }
    }

    private parseInsideSingleQuotes():void {
        let tempStringInsideQuotes :string = '';
        while(this.input[this.pos] !== '\'' && this.pos < this.inputLength) {
            if(this.input[this.pos] === '\\')
                this.pos += 1;
            tempStringInsideQuotes += this.input[this.pos];
            this.pos += 1;
        }

        if (this.input[(this.pos)] === '\'' && tempStringInsideQuotes.length !== 0) {
            this.output.push(tempStringInsideQuotes);
        }

        if (this.input[(this.pos)] !== '\'') {
            throw new Error('Incorrect single quote sequence')
        }

        this.pos += 1;
        return;
    }

    private parseInsideDoubleQuotes():void {
        let tempStringInsideQuotes :string = '';
        while(this.input[this.pos] !== '\"' && this.pos < this.inputLength) {
            if(this.input[this.pos] === '\\')
                this.pos += 1;
            tempStringInsideQuotes += this.input[this.pos];
            this.pos += 1;
        }

        if (this.input[(this.pos)] === '\"' && tempStringInsideQuotes.length !== 0) {
            this.output.push(tempStringInsideQuotes);
        }

        if (this.input[(this.pos)] !== '\"') {
            throw new Error('Incorrect double quote sequence')
        }

        this.pos += 1;
        return;
    }

    private parseInsideCommand() :void {
        let tempStringInsideQuotes :string = '';
        while(!delimeters.has(this.input[this.pos]) && this.pos < this.inputLength) {
            tempStringInsideQuotes += this.input[this.pos];
            this.pos += 1;
        }

        if (tempStringInsideQuotes.length !== 0) {
            this.output.push(tempStringInsideQuotes);
        }

        // если здесь прибавить - то пропустим след символ, а это применимо только в варианте когда мы считываем внутри одинарных кавычек
        // this.pos += 1;
        return;
    }


    //TODO: здесь еще есть простор для оптимизации - каждый case с обычными и фигурными скобками
    // неверное можно обрабатывать в отдельном подметоде, который сам себя вызывает рекурсивно
    // что будет выглядеть опрятнее, наверное
    private parseExpression(sentBracketFlag :string): void {
        let bracketFlag = sentBracketFlag;

        while (this.pos < this.inputLength) {
            switch((this.input)[this.pos]) {
                case '\\':
                    this.pos += 1;
                    this.output.push((this.input)[this.pos]);
                    this.pos += 1;

                    break;
                case '(':
                    // bracketFlag = 1;
                    this.pos += 1;
                    this.tempDepth += 1;

                    if (this.tempDepth > MAX_INPUT_LENGTH/2) {
                        throw new Error("Превышена максимальная глубина вложенности");
                    }

                    if (this.tempDepth > this.maxDepth) {
                        this.maxDepth = this.tempDepth;
                    }

                    this.parseExpression('(');

                    break;
                case ')':
                    if (bracketFlag !== '(') {
                        throw (new Error(`Incorrect ')' position`));
                    }
                    if (bracketFlag === '(' && this.tempDepth === 0) {
                        throw (new Error(`Incorrect ')' position`));
                    }
                    this.tempDepth -= 1;
                    this.pos += 1;

                    return;
                case '{':
                    this.pos += 1;
                    this.tempDepth += 1;

                    if (this.tempDepth > MAX_INPUT_LENGTH/2) {
                        throw new Error("Превышена максимальная глубина вложенности");
                    }

                    if (this.tempDepth > this.maxDepth) {
                        this.maxDepth = this.tempDepth;
                    }

                    this.parseExpression('{');

                    break;
                case '}':
                    if (bracketFlag !== '{') {
                        throw (new Error(`Incorrect '}' position`));
                    }
                    if (bracketFlag === '{' && this.tempDepth === 0) {
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
                    this.pos += 1;
                    break;
                default:
                    // это не нужно т.к. мы начинаем считывать с самого начала а не как в варианте с одинарными кавычками со следующего после кавычек
                    // this.pos += 1;

                    this.parseInsideCommand();
                    // this.pos += 1;

                    break;
            }
        }
    }

    public getMaxDepth() {
        return this.maxDepth;
    }

    public getOutput() :string[] {
        return this.output;
    }
}