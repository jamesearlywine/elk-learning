import { FileBase, IResolver } from "./file";
import { Project } from "./project";
export interface IgnoreFileOptions {
    /**
     * Filter out comment lines?
     *
     * @default true
     */
    readonly filterCommentLines?: boolean;
    /**
     * Filter out blank/empty lines?
     *
     * @default true
     */
    readonly filterEmptyLines?: boolean;
    /**
     * Patterns to add to the ignore file
     *
     * @default []
     */
    readonly ignorePatterns?: string[];
}
export declare class IgnoreFile extends FileBase {
    private readonly _patterns;
    readonly filterCommentLines: boolean;
    readonly filterEmptyLines: boolean;
    /**
     *
     * @param project The project to tie this file to.
     * @param filePath - the relative path in the project to put the file
     * @param minify - whether comments/blank lines should be filtered
     */
    constructor(project: Project, filePath: string, options?: IgnoreFileOptions);
    /**
     * Add ignore patterns. Files that match this pattern will be ignored. If the
     * pattern starts with a negation mark `!`, files that match will _not_ be
     * ignored.
     *
     * Comment lines (start with `#`) and blank lines ("") are filtered by default
     * but can be included using options specified when instantiating the component.
     *
     * @param patterns Ignore patterns.
     */
    addPatterns(...patterns: string[]): void;
    private normalizePatterns;
    /**
     * Removes patterns previously added from the ignore file.
     *
     * If `addPattern()` is called after this, the pattern will be added again.
     *
     * @param patterns patters to remove.
     */
    removePatterns(...patterns: string[]): void;
    /**
     * Ignore the files that match these patterns.
     * @param patterns The patterns to match.
     */
    exclude(...patterns: string[]): void;
    /**
     * Always include the specified file patterns.
     * @param patterns Patterns to include in git commits.
     */
    include(...patterns: string[]): void;
    protected synthesizeContent(resolver: IResolver): string | undefined;
}
