import { Pom } from "./pom";
import { Component } from "../component";
import { Project } from "../project";
/**
 * Options for `Junit`.
 */
export interface JunitOptions {
    /**
     * Java pom.
     */
    readonly pom: Pom;
    /**
     * Junit version
     *
     * @default "5.7.0"
     */
    readonly version?: string;
    /**
     * Java package for test sample.
     * @default "org.acme"
     */
    readonly sampleJavaPackage?: string;
}
/**
 * Implements JUnit-based testing.
 */
export declare class Junit extends Component {
    constructor(project: Project, options: JunitOptions);
}
