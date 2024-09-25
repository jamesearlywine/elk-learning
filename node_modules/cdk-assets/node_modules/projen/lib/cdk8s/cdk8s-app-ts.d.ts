import { Cdk8sDeps, Cdk8sDepsCommonOptions } from "./cdk8s-deps";
import { TypeScriptAppProject, TypeScriptProjectOptions } from "../typescript";
export interface Cdk8sTypeScriptAppOptions extends TypeScriptProjectOptions, Cdk8sDepsCommonOptions {
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
     * The CDK8s app's entrypoint (relative to the source directory, which is
     * "src" by default).
     *
     * @default "main.ts"
     */
    readonly appEntrypoint?: string;
    /**
     * Automatically adds an `cdk8s.IntegrationTest` for each `.integ.ts` app
     * in your test directory. If this is disabled, you can manually add an
     * `cdk8s.AutoDiscover` component to your project.
     *
     * @default true
     */
    readonly integrationTestAutoDiscover?: boolean;
}
/**
 * CDK8s app in TypeScript
 *
 *
 * @pjid cdk8s-app-ts
 */
export declare class Cdk8sTypeScriptApp extends TypeScriptAppProject {
    /**
     * The CDK8s app entrypoint
     */
    readonly appEntrypoint: string;
    readonly cdk8sDeps: Cdk8sDeps;
    constructor(options: Cdk8sTypeScriptAppOptions);
}
