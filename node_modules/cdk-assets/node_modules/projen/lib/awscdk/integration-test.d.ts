import { AwsCdkDeps } from "./awscdk-deps";
import { IntegrationTestBase, IntegrationTestBaseOptions } from "../cdk";
import { Project } from "../project";
import { Task } from "../task";
export interface IntegrationTestCommonOptions {
    /**
     * Destroy the test app after a successful deployment. If disabled, leaves the
     * app deployed in the dev account.
     * @default true
     */
    readonly destroyAfterDeploy?: boolean;
    /**
     * Enables path metadata, adding `aws:cdk:path`, with the defining construct's
     * path, to the CloudFormation metadata for each synthesized resource.
     * @default false
     */
    readonly pathMetadata?: boolean;
}
/**
 * Options for `IntegrationTest`.
 */
export interface IntegrationTestOptions extends IntegrationTestCommonOptions, IntegrationTestBaseOptions {
    /**
     * A list of stacks within the integration test to deploy/destroy.
     * @default ["**"]
     */
    readonly stacks?: string[];
    /**
     * AWS CDK dependency manager.
     */
    readonly cdkDeps: AwsCdkDeps;
}
/**
 * Cloud integration tests.
 */
export declare class IntegrationTest extends IntegrationTestBase {
    /**
     * Destroy the integration test resources
     */
    readonly destroyTask: Task;
    /**
     * The watch task.
     */
    readonly watchTask: Task;
    constructor(project: Project, options: IntegrationTestOptions);
}
