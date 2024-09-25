import { Cdk8sDeps, Cdk8sDepsCommonOptions } from "./cdk8s-deps";
import { PythonProject, PythonProjectOptions } from "../python/python-project";
/**
 * Options for `Cdk8sPythonApp`
 */
export interface Cdk8sPythonOptions extends PythonProjectOptions, Cdk8sDepsCommonOptions {
    /**
     * Import a specific Kubernetes spec version.
     *
     * @default - Use the cdk8s default
     */
    readonly k8sSpecVersion?: string;
    /**
     * Import additional specs
     *
     * @default - no additional specs imported
     */
    readonly cdk8sImports?: string[];
    /**
     * The CDK8s app's entrypoint
     *
     * @default "app.py"
     */
    readonly appEntrypoint?: string;
}
/**
 * CDK8s app in Python
 *
 *
 * @pjid cdk8s-app-py
 */
export declare class Cdk8sPythonApp extends PythonProject {
    /**
     * The CDK8s app entrypoint
     */
    readonly appEntrypoint: string;
    readonly cdk8sDeps: Cdk8sDeps;
    constructor(options: Cdk8sPythonOptions);
}
