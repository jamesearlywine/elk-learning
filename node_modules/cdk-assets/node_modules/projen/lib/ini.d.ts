import { IResolver } from "./file";
import { ObjectFile, ObjectFileOptions } from "./object-file";
import { Project } from "./project";
/**
 * Options for `IniFile`.
 */
export interface IniFileOptions extends ObjectFileOptions {
}
/**
 * Represents an INI file.
 */
export declare class IniFile extends ObjectFile {
    constructor(project: Project, filePath: string, options: IniFileOptions);
    protected synthesizeContent(resolver: IResolver): string | undefined;
}
