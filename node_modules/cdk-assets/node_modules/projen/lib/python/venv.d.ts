import { IPythonEnv } from "./python-env";
import { Component } from "../component";
import { Project } from "../project";
/**
 * Options for venv.
 */
export interface VenvOptions {
    /**
     * Name of directory to store the environment in
     *
     * @default ".env"
     */
    readonly envdir?: string;
    /**
     * Path to the python executable to use.
     * @default "python"
     */
    readonly pythonExec?: string;
}
/**
 * Manages a virtual environment through the Python venv module.
 */
export declare class Venv extends Component implements IPythonEnv {
    /**
     * Name of directory to store the environment in
     */
    private readonly envdir;
    /**
     * Path to the python executable to use.
     */
    private readonly pythonExec;
    constructor(project: Project, options?: VenvOptions);
    /**
     * Initializes the virtual environment if it doesn't exist (called during post-synthesis).
     */
    setupEnvironment(): void;
}
