import { Component } from "../component";
import { Project } from "../project";
export interface MavenSampleOptions {
    /**
     * Project root java package.
     */
    readonly package: string;
}
/**
 * Java code sample.
 */
export declare class MavenSample extends Component {
    constructor(project: Project, options: MavenSampleOptions);
}
