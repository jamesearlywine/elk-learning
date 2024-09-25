import { IntegrationTestAutoDiscoverBase, IntegrationTestAutoDiscoverBaseOptions } from "../cdk";
import { Component } from "../component";
import { Project } from "../project";
/**
 * Options for `AutoDiscover`.
 */
export interface AutoDiscoverOptions extends IntegrationTestAutoDiscoverOptions {
    /**
     * Automatically discover integration tests
     *
     * @default true
     */
    readonly integrationTestAutoDiscover?: boolean;
}
/**
 * Automatically discovers and creates `IntegrationTest`s from entry points
 * found in the test tree.
 */
export declare class AutoDiscover extends Component {
    constructor(project: Project, options: AutoDiscoverOptions);
}
export interface IntegrationTestAutoDiscoverOptions extends IntegrationTestAutoDiscoverBaseOptions {
    /**
     * Path to the tsconfig file to use for integration tests.
     */
    readonly tsconfigPath: string;
}
/**
 * Discovers and creates integration tests from files in the test root.
 */
export declare class IntegrationTestAutoDiscover extends IntegrationTestAutoDiscoverBase {
    constructor(project: Project, options: IntegrationTestAutoDiscoverOptions);
}
