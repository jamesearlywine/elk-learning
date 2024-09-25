import { Component } from "./component";
import { Project } from "./project";
/**
 * The `Dependencies` component is responsible to track the list of dependencies
 * a project has, and then used by project types as the model for rendering
 * project-specific dependency manifests such as the dependencies section
 * `package.json` files.
 *
 * To add a dependency you can use a project-type specific API such as
 * `nodeProject.addDeps()` or use the generic API of `project.deps`:
 */
export declare class Dependencies extends Component {
    /**
     * The project-relative path of the deps manifest file.
     */
    static readonly MANIFEST_FILE: string;
    /**
     * Returns the coordinates of a dependency spec.
     *
     * Given `foo@^3.4.0` returns `{ name: "foo", version: "^3.4.0" }`.
     * Given `bar@npm:@bar/legacy` returns `{ name: "bar", version: "npm:@bar/legacy" }`.
     */
    static parseDependency(spec: string): DependencyCoordinates;
    private readonly _deps;
    /**
     * Adds a dependencies component to the project.
     * @param project The parent project
     */
    constructor(project: Project);
    /**
     * A copy of all dependencies recorded for this project.
     *
     * The list is sorted by type->name->version
     */
    get all(): Dependency[];
    /**
     * Returns a dependency by name.
     *
     * Fails if there is no dependency defined by that name or if `type` is not
     * provided and there is more then one dependency type for this dependency.
     *
     * @param name The name of the dependency
     * @param type The dependency type. If this dependency is defined only for a
     * single type, this argument can be omitted.
     *
     * @returns a copy (cannot be modified)
     */
    getDependency(name: string, type?: DependencyType): Dependency;
    /**
     * Returns a dependency by name.
     *
     * Returns `undefined` if there is no dependency defined by that name or if
     * `type` is not provided and there is more then one dependency type for this
     * dependency.
     *
     * @param name The name of the dependency
     * @param type The dependency type. If this dependency is defined only for a
     * single type, this argument can be omitted.
     *
     * @returns a copy (cannot be modified) or undefined if there is no match
     */
    tryGetDependency(name: string, type?: DependencyType): Dependency | undefined;
    /**
     * Adds a dependency to this project.
     * @param spec The dependency spec in the format `MODULE[@VERSION]` where
     * `MODULE` is the package-manager-specific module name and `VERSION` is an
     * optional semantic version requirement (e.g. `^3.4.0`).
     * @param type The type of the dependency.
     */
    addDependency(spec: string, type: DependencyType, metadata?: {
        [key: string]: any;
    }): Dependency;
    /**
     * Removes a dependency.
     * @param name The name of the module to remove (without the version)
     * @param type The dependency type. This is only required if there the
     * dependency is defined for multiple types.
     */
    removeDependency(name: string, type?: DependencyType): void;
    /**
     * Checks if an existing dependency satisfies a dependency requirement.
     * @param name The name of the dependency to check (without the version).
     * @param type The dependency type.
     * @param expectedRange The version constraint to check (e.g. `^3.4.0`).
     * The constraint of the dependency must be a subset of the expected range to satisfy the requirements.
     * @returns `true` if the dependency exists and its version satisfies the provided constraint. `false` otherwise.
     * Notably returns `false` if a dependency exists, but has no version.
     */
    isDependencySatisfied(name: string, type: DependencyType, expectedRange: string): boolean;
    private tryGetDependencyIndex;
    private toJson;
}
export interface DepsManifest {
    /**
     * All dependencies of this module.
     */
    readonly dependencies: Dependency[];
}
/**
 * Coordinates of the dependency (name and version).
 */
export interface DependencyCoordinates {
    /**
     * The package manager name of the dependency (e.g. `leftpad` for npm).
     *
     * NOTE: For package managers that use complex coordinates (like Maven), we
     * will codify it into a string somehow.
     */
    readonly name: string;
    /**
     * Semantic version version requirement.
     *
     * @default - requirement is managed by the package manager (e.g. npm/yarn).
     */
    readonly version?: string;
}
/**
 * Represents a project dependency.
 */
export interface Dependency extends DependencyCoordinates {
    /**
     * Which type of dependency this is (runtime, build-time, etc).
     */
    readonly type: DependencyType;
    /**
     * Additional JSON metadata associated with the dependency (package manager
     * specific).
     * @default {}
     */
    readonly metadata?: {
        [key: string]: any;
    };
}
/**
 * Type of dependency.
 */
export declare enum DependencyType {
    /**
     * The dependency is required for the program/library during runtime.
     */
    RUNTIME = "runtime",
    /**
     * The dependency is required at runtime but expected to be installed by the
     * consumer.
     */
    PEER = "peer",
    /**
     * The dependency is bundled and shipped with the module, so consumers are not
     * required to install it.
     */
    BUNDLED = "bundled",
    /**
     * The dependency is required to run the `build` task.
     */
    BUILD = "build",
    /**
     * The dependency is required to run the `test` task.
     */
    TEST = "test",
    /**
     * The dependency is required for development (e.g. IDE plugins).
     */
    DEVENV = "devenv",
    /**
     * Transient dependency that needs to be overwritten.
     *
     * Available for Node packages
     */
    OVERRIDE = "override",
    /**
     * An optional dependency that may be used at runtime if available, but is not required.
     * It is expected to be installed by the consumer.
     */
    OPTIONAL = "optional"
}
