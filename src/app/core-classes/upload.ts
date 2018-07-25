import { GenerateGuid } from '../core-utils/generate.uid';

export class Upload {
    id: string;
    createdBy: string;
    name: string;
    url: string;
    size: number;
    progress: number;
    createdAt: Date = new Date();
    filePath: string; // a filePath in case we can't get the download path
    constructor(createdBy: string, filename: string, size: number) {
        this.id = GenerateGuid();
        this.createdBy = createdBy;
        this.name = filename;
        this.size = size;
    }
}
