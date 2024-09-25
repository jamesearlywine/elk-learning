import { IConstruct } from "constructs";
import { IResolver, FileBase } from "./file";
/**
 * The end of line characters supported by git.
 */
export declare enum EndOfLine {
    /**
     * Maintain existing (mixed values within one file are normalised by looking
     * at what's used after the first line)
     */
    AUTO = "auto",
    /**
     * Carriage Return + Line Feed characters (\r\n), common on Windows
     */
    CRLF = "crlf",
    /**
     * Line Feed only (\n), common on Linux and macOS as well as inside git repos
     */
    LF = "lf",
    /**
     * Disable and do not configure the end of line character
     */
    NONE = "none"
}
/**
 * Options for `GitAttributesFile`.
 */
export interface GitAttributesFileOptions {
    /**
     * The default end of line character for text files.
     *
     * endOfLine it's useful to keep the same end of line between Windows and Unix operative systems for git checking/checkout operations. Hence, it can avoid simple repository mutations consisting only of changes in the end of line characters. It will be set in the first line of the .gitattributes file to make it the first match with high priority but it can be overriden in a later line. Can be disabled by setting explicitly: `{ endOfLine: EndOfLine.NONE }`.
     *
     * @default EndOfLine.LF
     */
    readonly endOfLine?: EndOfLine;
}
/**
 * Assign attributes to file names in a git repository.
 *
 * @see https://git-scm.com/docs/gitattributes
 */
export declare class GitAttributesFile extends FileBase {
    private readonly attributes;
    /**
     * The default end of line character for text files.
     */
    readonly endOfLine: EndOfLine;
    constructor(scope: IConstruct, options?: GitAttributesFileOptions);
    /**
     * Maps a set of attributes to a set of files.
     * @param glob Glob pattern to match files in the repo
     * @param attributes Attributes to assign to these files.
     */
    addAttributes(glob: string, ...attributes: string[]): void;
    /**
     * Add attributes necessary to mark these files as stored in LFS
     */
    addLfsPattern(glob: string): void;
    /**
     * Whether the current gitattributes file has any LFS patterns
     */
    get hasLfsPatterns(): boolean;
    preSynthesize(): void;
    protected synthesizeContent(_: IResolver): string | undefined;
}
