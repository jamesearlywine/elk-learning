import { IConstruct } from "constructs";
import { IResolver } from "./file";
import { ObjectFile, ObjectFileOptions } from "./object-file";
/**
 * Options for `JsonFile`.
 */
export interface JsonFileOptions extends ObjectFileOptions {
    /**
     * Adds a newline at the end of the file.
     * @default true
     */
    readonly newline?: boolean;
    /**
     * Allow the use of comments in this file.
     * @default - false for .json files, true for .json5 and .jsonc files
     */
    readonly allowComments?: boolean;
}
/**
 * Represents a JSON file.
 */
export declare class JsonFile extends ObjectFile {
    private readonly newline;
    readonly supportsComments: boolean;
    constructor(scope: IConstruct, filePath: string, options: JsonFileOptions);
    protected synthesizeContent(resolver: IResolver): string | undefined;
}
