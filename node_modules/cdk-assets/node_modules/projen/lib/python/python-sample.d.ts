import { Component } from "../component";
import { Project } from "../project";
/**
 * Options for python sample code.
 */
export interface PythonSampleOptions {
    /**
     * Sample code directory
     */
    readonly dir: string;
}
/**
 * Python code sample.
 */
export declare class PythonSample extends Component {
    constructor(project: Project, options: PythonSampleOptions);
}
