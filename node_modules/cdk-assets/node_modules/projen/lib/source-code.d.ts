import { Component } from "./component";
import { Project } from "./project";
/**
 * Options for `SourceCodeFile`.
 */
export interface SourceCodeOptions {
    /**
     * Indentation size.
     * @default 2
     */
    readonly indent?: number;
    /**
     * Whether the generated file should be readonly.
     *
     * @default true
     */
    readonly readonly?: boolean;
}
/**
 * Represents a source file.
 */
export declare class SourceCode extends Component {
    readonly filePath: string;
    private readonly file;
    private indentLevel;
    private readonly indent;
    constructor(project: Project, filePath: string, options?: SourceCodeOptions);
    get marker(): string | undefined;
    /**
     * Emit a line of code.
     * @param code The contents, if not specified, just adds a newline
     */
    line(code?: string): void;
    /**
     * Opens a code block and increases the indentation level.
     *
     * @param code The code before the block starts (e.g. `export class {`).
     */
    open(code?: string): void;
    /**
     * Decreases the indentation level and closes a code block.
     *
     * @param code The code after the block is closed (e.g. `}`).
     */
    close(code?: string): void;
}
