class CommandParserLite {
    private input: string;
    // private output: string[] = '';
    private tempDepth: number;
    private maxDepth: number;
    private pos: number;

    constructor(input: string) {
        this.input = input;
        this.maxDepth = 0;
        this.tempDepth = 0;
        this.pos = 0;
    }

    public parse():void {

    }

    public parseExpression(): void {
        while (this.pos < this.input.length) {
            switch((this.input)[this.pos]) {
                case '(':
                    this.pos += 1;
                    this.tempDepth += 1;
                    this.maxDepth += 1;
                    this.parseExpression();
                    this.tempDepth -= 1;
                    break;
                case ')':
                    if (this.tempDepth === 0) {
                        throw (new Error(`Incorrect ')' position`));
                        // return;
                    }
                    this.pos += 1;
                    break;
                default:
                    this.pos += 1;
                    break;
            }
        }
    }

    public getMaxDepth() {
        return this.maxDepth;
    }
}