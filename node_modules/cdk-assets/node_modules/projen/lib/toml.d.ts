import { IResolver } from "./file";
import { ObjectFile, ObjectFileOptions } from "./object-file";
import { Project } from "./project";
/**
 * Options for `TomlFile`.
 */
export interface TomlFileOptions extends ObjectFileOptions {
}
/**
 * Represents a TOML file.
 */
export declare class TomlFile extends ObjectFile {
    constructor(project: Project, filePath: string, options: TomlFileOptions);
    protected synthesizeContent(resolver: IResolver): string | undefined;
}
