import { IConstruct } from "constructs";
import { Component } from "./component";
export interface FileBaseOptions {
    /**
     * Indicates whether this file should be committed to git or ignored. By
     * default, all generated files are committed and anti-tamper is used to
     * protect against manual modifications.
     *
     * @default true
     */
    readonly committed?: boolean;
    /**
     * Update the project's .gitignore file
     * @default true
     */
    readonly editGitignore?: boolean;
    /**
     * Whether the generated file should be readonly.
     *
     * @default true
     */
    readonly readonly?: boolean;
    /**
     * Whether the generated file should be marked as executable.
     *
     * @default false
     */
    readonly executable?: boolean;
    /**
     * Adds the projen marker to the file.
     *
     * @default - marker will be included as long as the project is not ejected
     */
    readonly marker?: boolean;
}
export declare abstract class FileBase extends Component {
    /**
     * The file path, relative to the project's outdir.
     */
    readonly path: string;
    /**
     * Indicates if the file should be read-only or read-write.
     */
    readonly: boolean;
    /**
     * Indicates if the file should be marked as executable
     */
    executable: boolean;
    /**
     * The absolute path of this file.
     */
    readonly absolutePath: string;
    private _changed?;
    private shouldAddMarker;
    /**
     * The projen marker, used to identify files as projen-generated.
     *
     * Value is undefined if the project is being ejected.
     */
    get marker(): string | undefined;
    constructor(scope: IConstruct, filePath: string, options?: FileBaseOptions);
    /**
     * Implemented by derived classes and returns the contents of the file to
     * emit.
     * @param resolver Call `resolver.resolve(obj)` on any objects in order to
     * resolve token functions.
     * @returns the content to synthesize or undefined to skip the file
     */
    protected abstract synthesizeContent(resolver: IResolver): string | undefined;
    /**
     * Writes the file to the project's output directory
     */
    synthesize(): void;
    /**
     * For debugging, check whether a file was incorrectly generated with
     * or without the projen marker. The projen marker does not *need* to be
     * included on projen-generated files, but it's recommended since it signals
     * that it probably should not be edited directly.
     */
    private checkForProjenMarker;
    /**
     * Indicates if the file has been changed during synthesis. This property is
     * only available in `postSynthesize()` hooks. If this is `undefined`, the
     * file has not been synthesized yet.
     */
    get changed(): boolean | undefined;
}
/**
 * API for resolving tokens when synthesizing file content.
 */
export interface IResolver {
    /**
     * Given a value (object/string/array/whatever, looks up any functions inside
     * the object and returns an object where all functions are called.
     * @param value The value to resolve
     * @package options Resolve options
     */
    resolve(value: any, options?: ResolveOptions): any;
}
/**
 * Resolve options.
 */
export interface ResolveOptions {
    /**
     * Omits empty arrays and objects.
     * @default false
     */
    readonly omitEmpty?: boolean;
    /**
     * Context arguments.
     * @default []
     */
    readonly args?: any[];
}
export interface IResolvable {
    /**
     * Resolves and returns content.
     */
    toJSON(): any;
}
