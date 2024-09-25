import { InitProjectOptionHints } from "./option-hints";
export interface CreateProjectOptions {
    /**
     * Directory that the project will be generated in.
     */
    readonly dir: string;
    /**
     * Fully-qualified name of the project type (usually formatted
     * as `projen.module.ProjectType`).
     * @example `projen.typescript.TypescriptProject`
     */
    readonly projectFqn: string;
    /**
     * Project options. Only JSON-like values can be passed in (strings,
     * booleans, numbers, enums, arrays, and objects that are not
     * derived from classes).
     *
     * Consult the API reference of the project type you are generating for
     * information about what fields and types are available.
     */
    readonly projectOptions: Record<string, any>;
    /**
     * Should we render commented-out default options in the projenrc file?
     * Does not apply to projenrc.json files.
     *
     * @default InitProjectOptionHints.FEATURED
     */
    readonly optionHints?: InitProjectOptionHints;
    /**
     * Should we call `project.synth()` or instantiate the project (could still
     * have side-effects) and render the .projenrc file.
     *
     * @default true
     */
    readonly synth?: boolean;
    /**
     * Should we execute post synthesis hooks? (usually package manager install).
     *
     * @default true
     */
    readonly post?: boolean;
}
/**
 * Programmatic API for projen.
 */
export declare class Projects {
    /**
     * Creates a new project with defaults.
     *
     * This function creates the project type in-process (with in VM) and calls
     * `.synth()` on it (if `options.synth` is not `false`).
     *
     * At the moment, it also generates a `.projenrc.js` file with the same code
     * that was just executed. In the future, this will also be done by the project
     * type, so we can easily support multiple languages of projenrc.
     *
     * An environment variable (PROJEN_CREATE_PROJECT=true) is set within the VM
     * so that custom project types can detect whether the current synthesis is the
     * result of a new project creation (and take additional steps accordingly)
     */
    static createProject(options: CreateProjectOptions): void;
    private constructor();
}
