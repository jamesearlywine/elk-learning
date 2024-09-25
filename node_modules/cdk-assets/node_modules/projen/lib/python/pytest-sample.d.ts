import { Component } from "..";
import { Project } from "../project";
/**
 * Options for python test code sample.
 */
export interface PytestSampleOptions {
    /**
     * Name of the python package as used in imports and filenames.
     */
    readonly moduleName: string;
    /**
     * Test directory
     */
    readonly testdir: string;
}
/**
 * Python test code sample.
 */
export declare class PytestSample extends Component {
    constructor(project: Project, options: PytestSampleOptions);
}
