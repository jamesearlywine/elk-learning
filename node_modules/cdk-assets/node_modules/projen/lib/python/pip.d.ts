import { IPythonDeps } from "./python-deps";
import { Component } from "../component";
import { Project } from "../project";
import { Task } from "../task";
/**
 * Options for pip
 */
export interface PipOptions {
}
/**
 * Manages dependencies using a requirements.txt file and the pip CLI tool.
 */
export declare class Pip extends Component implements IPythonDeps {
    readonly installCiTask: Task;
    constructor(project: Project, _options?: PipOptions);
    /**
     * Adds a runtime dependency.
     *
     * @param spec Format `<module>@<semver>`
     */
    addDependency(spec: string): void;
    /**
     * Adds a dev dependency.
     *
     * @param spec Format `<module>@<semver>`
     */
    addDevDependency(spec: string): void;
    /**
     * Installs dependencies (called during post-synthesis).
     */
    installDependencies(): void;
}
