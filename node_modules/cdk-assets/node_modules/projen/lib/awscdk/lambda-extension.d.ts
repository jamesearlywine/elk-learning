import { AwsCdkDeps } from "./awscdk-deps";
import { LambdaRuntime } from "./lambda-function";
import { Component } from "../component";
import { BundlingOptions } from "../javascript";
import { Project } from "../project";
/**
 * Common options for creating lambda extensions.
 */
export interface LambdaExtensionCommonOptions {
    /**
     * The extension's compatible runtimes.
     */
    readonly compatibleRuntimes?: LambdaRuntime[];
    /**
     * Bundling options for this AWS Lambda extension.
     *
     * If not specified the default bundling options specified for the project
     * `Bundler` instance will be used.
     *
     * @default - defaults
     */
    readonly bundlingOptions?: BundlingOptions;
}
/**
 * Options for creating lambda extensions.
 */
export interface LambdaExtensionOptions extends LambdaExtensionCommonOptions {
    /**
     * Name of the extension
     *
     * @default - Derived from the entrypoint filename.
     */
    readonly name?: string;
    /**
     * A path from the project root directory to a TypeScript file which contains
     * the AWS Lambda extension entrypoint (stand-alone script).
     *
     * This is relative to the root directory of the project.
     *
     * @example "src/subdir/foo.lambda-extension.ts"
     */
    readonly entrypoint: string;
    /**
     * AWS CDK dependency manager.
     */
    readonly cdkDeps: AwsCdkDeps;
    /**
     * The name of the generated TypeScript source file. This file should also be
     * under the source tree.
     *
     * @default - The name of the entrypoint file, with the `-layer-version.ts`
     * suffix instead of `.lambda-extension.ts`.
     */
    readonly constructFile?: string;
    /**
     * The name of the generated `lambda.LayerVersion` subclass.
     *
     * @default - A pascal cased version of the name of the entrypoint file, with
     * the extension `LayerVersion` (e.g. `AppConfigLayerVersion`).
     */
    readonly constructName?: string;
}
/**
 * Create a Lambda Extension
 */
export declare class LambdaExtension extends Component {
    constructor(project: Project, options: LambdaExtensionOptions);
}
