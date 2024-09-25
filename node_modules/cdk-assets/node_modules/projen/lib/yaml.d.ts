import { IConstruct } from "constructs";
import { IResolver } from "./file";
import { ObjectFile, ObjectFileOptions } from "./object-file";
/**
 * Options for `JsonFile`.
 */
export interface YamlFileOptions extends ObjectFileOptions {
    /**
     * Maximum line width (set to 0 to disable folding).
     *
     * @default - 0
     */
    readonly lineWidth?: number;
}
/**
 * Represents a YAML file.
 */
export declare class YamlFile extends ObjectFile {
    /**
     * Maximum line width (set to 0 to disable folding).
     */
    lineWidth: number;
    constructor(scope: IConstruct, filePath: string, options: YamlFileOptions);
    protected synthesizeContent(resolver: IResolver): string | undefined;
}
