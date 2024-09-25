import { Component } from "../component";
import { DependencyType } from "../dependencies";
import { Project } from "../project";
/**
 * Options for `Cdk8sDeps`
 */
export interface Cdk8sDepsCommonOptions {
    /**
     * Minimum version of the cdk8s to depend on.
     *
     * @default "2.3.33"
     */
    readonly cdk8sVersion: string;
    /**
     * Minimum version of the cdk8s-cli to depend on.
     *
     * @default "2.0.28"
     */
    readonly cdk8sCliVersion?: string;
    /**
     * Minimum version of the `constructs` library to depend on.
     *
     * @default "10.1.42"
     */
    readonly constructsVersion?: string;
    /**
     * Use pinned version instead of caret version for cdk8s.
     *
     * You can use this to prevent yarn to mix versions for your CDK8s package and to prevent auto-updates.
     * If you use experimental features this will let you define the moment you include breaking changes.
     *
     * @default false
     */
    readonly cdk8sVersionPinning?: boolean;
    /**
     * Use pinned version instead of caret version for cdk8s-cli.
     *
     * You can use this to prevent yarn to mix versions for your CDK8s package and to prevent auto-updates.
     * If you use experimental features this will let you define the moment you include breaking changes.
     *
     * @default false
     */
    readonly cdk8sCliVersionPinning?: boolean;
    /**
     * Use pinned version instead of caret version for constructs.
     *
     * You can use this to prevent yarn to mix versions for your consructs package and to prevent auto-updates.
     * If you use experimental features this will let you define the moment you include breaking changes.
     *
     * @default false
     */
    readonly constructsVersionPinning?: boolean;
    /**
     * Include cdk8s-plus
     *
     * @default true
     */
    readonly cdk8sPlus?: boolean;
    /**
     * The cdk8s-plus library depends of Kubernetes minor version
     * For example, cdk8s-plus-22 targets kubernetes version 1.22.0
     * cdk8s-plus-21 targets kubernetes version 1.21.0
     *
     * @default 22
     */
    readonly k8sMinorVersion?: number;
    /**
     * Minimum version of the cdk8s-plus-XX to depend on.
     *
     * @default "2.0.0-rc.26"
     */
    readonly cdk8sPlusVersion?: string;
    /**
     * Use pinned version instead of caret version for cdk8s-plus-17.
     *
     * You can use this to prevent yarn to mix versions for your CDK8s package and to prevent auto-updates.
     * If you use experimental features this will let you define the moment you include breaking changes.
     *
     * @default false
     */
    readonly cdk8sPlusVersionPinning?: boolean;
}
export interface Cdk8sDepsOptions extends Cdk8sDepsCommonOptions {
    /**
     * The type of dependency to use for runtime CDK8s and `constructs` modules.
     *
     * For libraries, use peer dependencies and for apps use runtime dependencies.
     */
    readonly dependencyType: DependencyType;
    /**
     * Add cdk8s-cli only to Node projects
     *
     * @default false
     */
    readonly cdk8sCliDependency: boolean;
}
export interface Cdk8sPackageNames {
    /**
     * Fully qualified name of the core framework package
     */
    readonly cdk8s: string;
    /**
     * Fully qualified name of the client package.
     * Used only on Node projects
     */
    readonly cdk8sClient?: string;
    /**
     * Fully qualified name of the constructs library package
     */
    readonly constructs: string;
    /**
     * Fully qualified name of the cdk9s-plus-XX library package
     */
    readonly cdk8sPlus: string;
}
/**
 * Manages dependencies on the CDK8s.
 */
export declare abstract class Cdk8sDeps extends Component {
    /**
     * The dependency requirement for CDK8s.
     */
    readonly cdk8sVersion: string;
    /**
     * The minimum version of the CDK8s (e.g. `2.0.0`)
     */
    readonly cdk8sMinimumVersion: string;
    /**
     * The major version of the CDK8s (e.g. 1, 2, ...)
     */
    readonly cdk8sMajorVersion: number;
    private readonly dependencyType;
    private readonly _packageNames;
    constructor(project: Project, options: Cdk8sDepsOptions);
    /**
     * Return a configuration object with information about package naming in various languages
     */
    protected abstract packageNames(): Cdk8sPackageNames;
    private getVersionRequirement;
    private addCdk8sPlusDependency;
    private addClientDependency;
    private addFrameworkDependency;
    private addConstructsDependency;
}
