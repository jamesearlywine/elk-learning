import { Junit, JunitOptions } from "./junit";
import { MavenCompile, MavenCompileOptions } from "./maven-compile";
import { MavenPackaging, MavenPackagingOptions } from "./maven-packaging";
import { PluginOptions, Pom, PomOptions } from "./pom";
import { Projenrc as ProjenrcJava, ProjenrcOptions } from "./projenrc";
import { GitHubProject, GitHubProjectOptions } from "../github";
/**
 * Options for `JavaProject`.
 */
export interface JavaProjectCommonOptions extends GitHubProjectOptions, PomOptions {
    /**
     * Final artifact output directory.
     *
     * @default "dist/java"
     */
    readonly distdir?: string;
    /**
     * List of runtime dependencies for this project.
     *
     * Dependencies use the format: `<groupId>/<artifactId>@<semver>`
     *
     * Additional dependencies can be added via `project.addDependency()`.
     *
     * @default []
     * @featured
     */
    readonly deps?: string[];
    /**
     * List of test dependencies for this project.
     *
     * Dependencies use the format: `<groupId>/<artifactId>@<semver>`
     *
     * Additional dependencies can be added via `project.addTestDependency()`.
     *
     * @default []
     * @featured
     */
    readonly testDeps?: string[];
    /**
     * Include junit tests.
     * @default true
     */
    readonly junit?: boolean;
    /**
     * junit options
     * @default - defaults
     */
    readonly junitOptions?: JunitOptions;
    /**
     * Packaging options.
     * @default - defaults
     */
    readonly packagingOptions?: MavenPackagingOptions;
    /**
     * Compile options.
     * @default - defaults
     */
    readonly compileOptions?: MavenCompileOptions;
    /**
     * Use projenrc in java.
     *
     * This will install `projen` as a java dependency and will add a `synth` task which
     * will compile & execute `main()` from `src/main/java/projenrc.java`.
     *
     * @default true
     */
    readonly projenrcJava?: boolean;
    /**
     * Options related to projenrc in java.
     * @default - default options
     */
    readonly projenrcJavaOptions?: ProjenrcOptions;
}
/**
 * Options for `JavaProject`.
 */
export interface JavaProjectOptions extends JavaProjectCommonOptions {
    /**
     * Include sample code and test if the relevant directories don't exist.
     * @default true
     */
    readonly sample?: boolean;
    /**
     * The java package to use for the code sample.
     * @default "org.acme"
     */
    readonly sampleJavaPackage?: string;
}
/**
 * Java project.
 *
 * @pjid java
 */
export declare class JavaProject extends GitHubProject {
    /**
     * API for managing `pom.xml`.
     */
    readonly pom: Pom;
    /**
     * JUnit component.
     */
    readonly junit?: Junit;
    /**
     * Packaging component.
     */
    readonly packaging: MavenPackaging;
    /**
     * Compile component.
     */
    readonly compile: MavenCompile;
    /**
     * Projenrc component.
     */
    readonly projenrc?: ProjenrcJava;
    /**
     * Maven artifact output directory.
     */
    readonly distdir: string;
    constructor(options: JavaProjectOptions);
    /**
     * Adds a runtime dependency.
     *
     * @param spec Format `<groupId>/<artifactId>@<semver>`
     */
    addDependency(spec: string): void;
    /**
     * Adds a test dependency.
     *
     * @param spec Format `<groupId>/<artifactId>@<semver>`
     */
    addTestDependency(spec: string): void;
    /**
     * Adds a build plugin to the pom.
     *
     * The plug in is also added as a BUILD dep to the project.
     *
     * @param spec dependency spec (`group/artifact@version`)
     * @param options plugin options
     */
    addPlugin(spec: string, options?: PluginOptions): import("..").Dependency;
}
