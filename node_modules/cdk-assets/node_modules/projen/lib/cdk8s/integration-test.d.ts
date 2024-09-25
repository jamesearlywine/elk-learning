import { IntegrationTestBaseOptions, IntegrationTestBase } from "../cdk";
import { Project } from "../project";
/**
 * Options for IntegrationTest
 */
export interface IntegrationTestOptions extends IntegrationTestBaseOptions {
}
/**
 * CDK8S integration test.
 */
export declare class IntegrationTest extends IntegrationTestBase {
    constructor(project: Project, options: IntegrationTestOptions);
}
