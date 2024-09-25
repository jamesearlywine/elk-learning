import { Pom } from "./pom";
import { Component } from "../component";
import { Project } from "../project";
/**
 * Options for `MavenPackage`.
 */
export interface MavenPackagingOptions {
    /**
     * Include sources jar in package.
     * @default true
     */
    readonly sources?: boolean;
    /**
     * Where to place the package output?
     * @default "dist/java"
     */
    readonly distdir?: string;
    /**
     * Include javadocs jar in package.
     * @default true
     */
    readonly javadocs?: boolean;
    /**
     * Exclude source files from docs.
     * @default []
     */
    readonly javadocsExclude?: string[];
}
/**
 * Configures a maven project to produce a .jar archive with sources and javadocs.
 */
export declare class MavenPackaging extends Component {
    /**
     * The directory containing the package output, relative to the project outdir
     */
    readonly distdir: string;
    constructor(project: Project, pom: Pom, options?: MavenPackagingOptions);
}
