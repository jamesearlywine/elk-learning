import { Component } from "../component";
import { Project } from "../project";
/**
 * Options for `AutoDiscoverBase`
 */
export interface AutoDiscoverBaseOptions {
    /**
     * Locate files with the given extension.
     *
     * @example ".integ.ts"
     */
    readonly extension: string;
    /**
     * Locate entrypoints in the given project directory.
     *
     * @example "test"
     */
    readonly projectdir: string;
}
/**
 * Base class for auto-discovering and creating project subcomponents.
 */
export declare abstract class AutoDiscoverBase extends Component {
    /**
     * Auto-discovered entry points with paths relative to the project
     * directory.
     */
    readonly entrypoints: string[];
    constructor(project: Project, options: AutoDiscoverBaseOptions);
}
/**
 * Options for `IntegrationTestAutoDiscoverBase`
 */
export interface IntegrationTestAutoDiscoverBaseOptions {
    /**
     * Test source tree.
     */
    readonly testdir: string;
}
/**
 * Base class for locating integration tests in the project's test tree.
 */
export declare class IntegrationTestAutoDiscoverBase extends AutoDiscoverBase {
    constructor(project: Project, options: IntegrationTestAutoDiscoverBaseOptions);
}
