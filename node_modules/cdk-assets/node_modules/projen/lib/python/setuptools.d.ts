import { IPythonPackaging, PythonPackagingOptions } from "./python-packaging";
import { PythonExecutableOptions } from "./python-project";
import { Component } from "../component";
import { Project } from "../project";
import { Task } from "../task";
export interface SetuptoolsOptions extends PythonPackagingOptions, PythonExecutableOptions {
}
/**
 * Manages packaging through setuptools with a setup.py script.
 */
export declare class Setuptools extends Component implements IPythonPackaging {
    readonly publishTask: Task;
    /**
     * A task that uploads the package to the Test PyPI repository.
     */
    readonly publishTestTask: Task;
    private readonly pythonExec;
    constructor(project: Project, options: SetuptoolsOptions);
}
