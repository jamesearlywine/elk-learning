import { Component } from "./component";
import { Project } from "./project";
/**
 * Options for the SampleFile object.
 */
export interface SampleFileOptions {
    /**
     * The contents of the file to write.
     */
    readonly contents?: string;
    /**
     * Absolute path to a file to copy the contents from (does not need to be
     * a text file).
     *
     * If your project is Typescript-based and has configured `testdir` to be a
     * subdirectory of `src`, sample files should outside of the `src` directory,
     * otherwise they may not be copied. For example:
     * ```
     * new SampleFile(this, 'assets/icon.png', { sourcePath: path.join(__dirname, '..', 'sample-assets', 'icon.png') });
     * ```
     */
    readonly sourcePath?: string;
}
/**
 * Produces a file with the given contents but only once, if the file doesn't already exist.
 * Use this for creating example code files or other resources.
 */
export declare class SampleFile extends Component {
    private readonly filePath;
    private readonly options;
    /**
     * Creates a new SampleFile object
     * @param project - the project to tie this file to.
     * @param filePath - the relative path in the project to put the file
     * @param options - the options for the file.
     */
    constructor(project: Project, filePath: string, options: SampleFileOptions);
    synthesize(): void;
    /**
     * A helper function that will write the file once and return if it was written or not.
     * @param dir - the directory for the new file
     * @param filename - the filename for the new file
     * @param contents - the contents of the file to write
     * @return boolean - whether a new file was written or not.
     * @private
     */
    private writeOnceFileContents;
}
/**
 * SampleDir options
 */
export interface SampleDirOptions {
    /**
     * The files to render into the directory. These files get added after
     * any files from `source` if that option is specified (replacing if names
     * overlap).
     */
    readonly files?: {
        [fileName: string]: string;
    };
    /**
     * Absolute path to a directory to copy files from (does not need to be text
     * files).
     *
     * If your project is typescript-based and has configured `testdir` to be a
     * subdirectory of `src`, sample files should outside of the `src` directory
     * otherwise they may not be copied. For example:
     * ```
     * new SampleDir(this, 'public', { source: path.join(__dirname, '..', 'sample-assets') });
     * ```
     */
    readonly sourceDir?: string;
}
/**
 * Renders the given files into the directory if the directory does not exist. Use this to create sample code files
 */
export declare class SampleDir extends Component {
    private readonly dir;
    private readonly options;
    /**
     * Create sample files in the given directory if the given directory does not exist
     * @param project Parent project to add files to.
     * @param dir directory to add files to. If directory already exists, nothing is added.
     * @param options options for which files to create.
     */
    constructor(project: Project, dir: string, options: SampleDirOptions);
    synthesize(): void;
}
