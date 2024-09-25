import { IConstruct } from "constructs";
import { FileBase, FileBaseOptions, IResolver } from "./file";
/**
 * Options for `TextFile`.
 */
export interface TextFileOptions extends FileBaseOptions {
    /**
     * The contents of the text file. You can use `addLine()` to append lines.
     *
     * @default [] empty file
     */
    readonly lines?: string[];
}
/**
 * A text file.
 */
export declare class TextFile extends FileBase {
    private readonly lines;
    /**
     * Defines a text file.
     *
     * @param project The project
     * @param filePath File path
     * @param options Options
     */
    constructor(scope: IConstruct, filePath: string, options?: TextFileOptions);
    /**
     * Adds a line to the text file.
     * @param line the line to add (can use tokens)
     */
    addLine(line: string): void;
    protected synthesizeContent(_: IResolver): string | undefined;
}
