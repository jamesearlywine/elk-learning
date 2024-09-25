import { FileBase, IResolver } from "../file";
import { Project } from "../project";
/**
 * Fields to pass in the setup() function of setup.py
 *
 * @see https://docs.python.org/3/distutils/setupscript.html
 */
export interface SetupPyOptions {
    /**
     * Name of the package
     */
    readonly name?: string;
    /**
     * List of submodules to be packaged
     */
    readonly packages?: string[];
    /**
     * Author's name
     */
    readonly authorName?: string;
    /**
     * Author's e-mail
     */
    readonly authorEmail?: string;
    /**
     * Manually specify package version
     */
    readonly version?: string;
    /**
     * A short project description
     */
    readonly description?: string;
    /**
     * The project license
     */
    readonly license?: string;
    /**
     * Package's Homepage / Website
     */
    readonly homepage?: string;
    /**
     * A list of PyPI trove classifiers that describe the project.
     *
     * @see https://pypi.org/classifiers/
     */
    readonly classifiers?: string[];
    /**
     * Escape hatch to allow any value
     */
    readonly additionalOptions?: {
        [name: string]: any;
    };
    /**
     * Escape hatch to allow any value (JS/TS only)
     *
     * @deprecated Prefer using `additionalOptions` instead.
     *
     * @jsii ignore
     */
    readonly [name: string]: any;
}
/**
 * Python packaging script where package metadata can be placed.
 */
export declare class SetupPy extends FileBase {
    private readonly setupConfig;
    constructor(project: Project, options: SetupPyOptions);
    protected synthesizeContent(resolver: IResolver): string | undefined;
    private renameFields;
}
