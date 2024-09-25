import { AwsCdkDeps, AwsCdkPackageNames } from "./awscdk-deps";
/**
 * Manages dependencies on the AWS CDK for Python projects.
 */
export declare class AwsCdkDepsPy extends AwsCdkDeps {
    protected packageNames(): AwsCdkPackageNames;
}
