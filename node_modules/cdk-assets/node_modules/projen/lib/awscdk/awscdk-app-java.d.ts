import { AwsCdkDeps, AwsCdkDepsCommonOptions } from "./awscdk-deps";
import { CdkConfig, CdkConfigCommonOptions } from "./cdk-config";
import { CdkTasks } from "./cdk-tasks";
import { JavaProject, JavaProjectOptions } from "../java";
export interface AwsCdkJavaAppOptions extends JavaProjectOptions, CdkConfigCommonOptions, AwsCdkDepsCommonOptions {
    /**
     * The name of the Java class with the static `main()` method. This method
     * should call `app.synth()` on the CDK app.
     *
     * @default "org.acme.MyApp"
     */
    readonly mainClass: string;
}
/**
 * AWS CDK app in Java.
 *
 * @pjid awscdk-app-java
 */
export declare class AwsCdkJavaApp extends JavaProject {
    /**
     * The `cdk.json` file.
     */
    readonly cdkConfig: CdkConfig;
    /**
     * CDK dependency management helper class
     */
    readonly cdkDeps: AwsCdkDeps;
    /**
     * The full name of the main class of the java app (package.Class).
     */
    readonly mainClass: string;
    /**
     * CDK tasks.
     */
    readonly cdkTasks: CdkTasks;
    /**
     * The name of the Java package that includes the main class.
     */
    readonly mainPackage: string;
    /**
     * The name of the Java class with the static `main()` method.
     */
    readonly mainClassName: string;
    constructor(options: AwsCdkJavaAppOptions);
    /**
     * Adds an AWS CDK module dependencies
     *
     * @param modules The list of modules to depend on (e.g. "software.amazon.awscdk/aws-lambda", "software.amazon.awscdk/aws-iam", etc)
     * @deprecated In CDK 2.x all modules are available by default. Alpha modules should be added using the standard 'deps'
     */
    addCdkDependency(...modules: string[]): void;
    private addSample;
}
