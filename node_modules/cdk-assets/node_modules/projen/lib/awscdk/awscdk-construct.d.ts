import { AwsCdkDeps, AwsCdkDepsCommonOptions } from "./awscdk-deps";
import { LambdaFunctionCommonOptions } from "./lambda-function";
import { ConstructLibrary, ConstructLibraryOptions } from "../cdk";
/**
 * Options for `AwsCdkConstructLibrary`.
 */
export interface AwsCdkConstructLibraryOptions extends ConstructLibraryOptions, AwsCdkDepsCommonOptions {
    /**
     * Automatically adds an `aws_lambda.Function` for each `.lambda.ts` handler
     * in your source tree. If this is disabled, you either need to explicitly
     * call `aws_lambda.Function.autoDiscover()` or define a `new
     * aws_lambda.Function()` for each handler.
     *
     * @default true
     */
    readonly lambdaAutoDiscover?: boolean;
    /**
     * Automatically adds an `cloudfront.experimental.EdgeFunction` for each
     * `.edge-lambda.ts` handler in your source tree. If this is disabled, you can
     * manually add an `awscdk.AutoDiscover` component to your project.
     *
     * @default true
     */
    readonly edgeLambdaAutoDiscover?: boolean;
    /**
     * Automatically adds an `awscdk.LambdaExtension` for each `.lambda-extension.ts`
     * entrypoint in your source tree. If this is disabled, you can manually add an
     * `awscdk.AutoDiscover` component to your project
     *
     * @default true
     */
    readonly lambdaExtensionAutoDiscover?: boolean;
    /**
     * Automatically discovers and creates integration tests for each `.integ.ts`
     * file under your test directory.
     *
     * @default true
     */
    readonly integrationTestAutoDiscover?: boolean;
    /**
     * Enable experimental support for the AWS CDK integ-runner.
     *
     * @default false
     * @experimental
     */
    readonly experimentalIntegRunner?: boolean;
    /**
     * Common options for all AWS Lambda functions.
     *
     * @default - default options
     */
    readonly lambdaOptions?: LambdaFunctionCommonOptions;
}
/**
 * AWS CDK construct library project
 *
 * A multi-language (jsii) construct library which vends constructs designed to
 * use within the AWS CDK with a friendly workflow and automatic publishing to
 * the construct catalog.
 *
 * @pjid awscdk-construct
 */
export declare class AwsCdkConstructLibrary extends ConstructLibrary {
    readonly cdkDeps: AwsCdkDeps;
    constructor(options: AwsCdkConstructLibraryOptions);
    /**
     * The target CDK version for this library.
     */
    get cdkVersion(): string;
    /**
     * @deprecated use `cdkVersion`
     */
    get version(): string;
    /**
     * Adds dependencies to AWS CDK modules.
     *
     * Since this is a library project, dependencies will be added as peer dependencies.
     *
     * @param deps names of cdk modules (e.g. `@aws-cdk/aws-lambda`).
     * @deprecated Not supported in v2. For v1, use `project.cdkDeps.addV1Dependencies()`
     */
    addCdkDependencies(...deps: string[]): void;
    /**
     * Adds AWS CDK modules as dev dependencies.
     *
     * @param deps names of cdk modules (e.g. `@aws-cdk/aws-lambda`).
     * @deprecated Not supported in v2. For v1, use `project.cdkDeps.addV1DevDependencies()`
     */
    addCdkTestDependencies(...deps: string[]): void;
}
/** @deprecated use `AwsCdkConstructLibraryOptions` */
export interface ConstructLibraryAwsOptions extends AwsCdkConstructLibraryOptions {
}
/** @deprecated use `AwsCdkConstructLibrary` */
export declare class ConstructLibraryAws extends AwsCdkConstructLibrary {
}
