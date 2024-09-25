import { Pom } from "./pom";
import { Component } from "../component";
import { Project } from "../project";
/**
 * Options for `MavenCompile`.
 */
export interface MavenCompileOptions {
    /**
     * Source language version.
     *
     * @default "1.8"
     */
    readonly source?: string;
    /**
     * Target JVM version.
     *
     * @default "1.8"
     */
    readonly target?: string;
}
/**
 * Adds the maven-compiler plugin to a POM file and the `compile` task.
 */
export declare class MavenCompile extends Component {
    constructor(project: Project, pom: Pom, options?: MavenCompileOptions);
}
