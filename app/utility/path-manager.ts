export class PathManager {
    private static getSeparator(): string {
        return process.platform === 'win32' ? ';' : ':';
    }

    static addDirectory(directory: string): void {
        const separator = this.getSeparator();
        process.env.PATH = process.env.PATH + separator + directory;
    }

    static removeDirectory(directory: string): void {
        const separator = this.getSeparator();
        const pathArray = process.env.PATH?.split(separator) || [];
        const filteredPath = pathArray.filter(dir => dir !== directory);
        process.env.PATH = filteredPath.join(separator);
    }

    static hasDirectory(directory: string): boolean {
        const separator = this.getSeparator();
        const pathArray = process.env.PATH?.split(separator) || [];
        return pathArray.includes(directory);
    }

    static getAvaliableDirectories() :string[] | null {
        return process.env.PATH?.split(this.getSeparator()) as string[] || null;
    }
}