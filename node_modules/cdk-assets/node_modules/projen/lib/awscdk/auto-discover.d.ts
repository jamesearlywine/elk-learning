import { AwsCdkDeps } from "./awscdk-deps";
import { IntegrationTestCommonOptions } from "./integration-test";
import { LambdaExtensionCommonOptions } from "./lambda-extension";
import { LambdaFunctionCommonOptions } from "./lambda-function";
import { AutoDiscoverBase, IntegrationTestAutoDiscoverBase, IntegrationTestAutoDiscoverBaseOptions } from "../cdk";
import { Component } from "../component";
import { Project } from "../project";
/**
 * Common options for auto discovering project subcomponents.
 */
export interface AutoDiscoverCommonOptions {
    /**
     * Path to the tsconfig file to use for integration tests.
     */
    readonly tsconfigPath: string;
    /**
     * AWS CDK dependency manager.
     */
    readonly cdkDeps: AwsCdkDeps;
}
/**
 * Options for `IntegrationTestAutoDiscover`
 */
export interface IntegrationTestAutoDiscoverOptions extends AutoDiscoverCommonOptions, IntegrationTestAutoDiscoverBaseOptions {
    /**
     * Options for integration tests.
     */
    readonly integrationTestOptions?: IntegrationTestCommonOptions;
}
/**
 * Creates integration tests from entry points discovered in the test tree.
 */
export declare class IntegrationTestAutoDiscover extends IntegrationTestAutoDiscoverBase {
    constructor(project: Project, options: IntegrationTestAutoDiscoverOptions);
}
/**
 * Options for `LambdaAutoDiscover`
 */
export interface LambdaAutoDiscoverOptions extends AutoDiscoverCommonOptions {
    /**
     * Project source tree (relative to project output directory).
     */
    readonly srcdir: string;
    /**
     * Options for AWS Lambda functions.
     */
    readonly lambdaOptions?: LambdaFunctionCommonOptions;
}
/**
 * Creates lambdas from entry points discovered in the project's source tree.
 */
export declare class LambdaAutoDiscover extends AutoDiscoverBase {
    constructor(project: Project, options: LambdaAutoDiscoverOptions);
}
/**
 * Options for `EdgeLambdaAutoDiscover`
 */
export interface EdgeLambdaAutoDiscoverOptions extends AutoDiscoverCommonOptions {
    /**
     * Project source tree (relative to project output directory).
     */
    readonly srcdir: string;
    /**
     * Options for AWS Lambda functions.
     */
    readonly lambdaOptions?: LambdaFunctionCommonOptions;
}
/**
 * Creates edge lambdas from entry points discovered in the project's source tree.
 */
export declare class EdgeLambdaAutoDiscover extends AutoDiscoverBase {
    constructor(project: Project, options: EdgeLambdaAutoDiscoverOptions);
}
/**
 * Options for `LambdaExtensionAutoDiscover`
 */
export interface LambdaExtensionAutoDiscoverOptions extends AutoDiscoverCommonOptions {
    /**
     * Project source tree (relative to project output directory).
     */
    readonly srcdir: string;
    /**
     * Options for lambda extensions.
     */
    readonly lambdaExtensionOptions?: LambdaExtensionCommonOptions;
}
/**
 * Creates Lambda Extensions from entrypoints discovered in the project's
 * source tree.
 */
export declare class LambdaExtensionAutoDiscover extends AutoDiscoverBase {
    constructor(project: Project, options: LambdaExtensionAutoDiscoverOptions);
}
/**
 * Options for `AutoDiscover`
 */
export interface AutoDiscoverOptions extends LambdaAutoDiscoverOptions, LambdaExtensionAutoDiscoverOptions, IntegrationTestAutoDiscoverOptions {
    /**
     * Auto-discover lambda functions.
     *
     * @default true
     */
    readonly lambdaAutoDiscover?: boolean;
    /**
     * Auto-discover edge lambda functions.
     *
     * @default true
     */
    readonly edgeLambdaAutoDiscover?: boolean;
    /**
     * Auto-discover lambda extensions.
     *
     * @default true
     */
    readonly lambdaExtensionAutoDiscover?: boolean;
    /**
     * Auto-discover integration tests.
     *
     * @default true
     */
    readonly integrationTestAutoDiscover?: boolean;
}
/**
 * Discovers and creates integration tests and lambdas from code in the
 * project's source and test trees.
 */
export declare class AutoDiscover extends Component {
    constructor(project: Project, options: AutoDiscoverOptions);
}
