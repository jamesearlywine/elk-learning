import { Pom } from "./pom";
import { ProjectOption } from "../inventory";
import { Project } from "../project";
import { ProjenrcFile } from "../projenrc";
/**
 * Options for `Projenrc`.
 */
export interface ProjenrcOptions {
    /**
     * The name of the Java class which contains the `main()` method for projen.
     * @default "projenrc"
     */
    readonly className?: string;
    /**
     * The projen version to use
     * @default - current version
     */
    readonly projenVersion?: string;
    /**
     * Defines projenrc under the test scope instead of the main scope, which is
     * reserved to the app. This means that projenrc will be under
     * `src/test/java/projenrc.java` and projen will be defined as a test
     * dependency. This enforces that application code does not take a dependency
     * on projen code.
     *
     * If this is disabled, projenrc should be under
     * `src/main/java/projenrc.java`.
     *
     * @default true
     */
    readonly testScope?: boolean;
}
/**
 * Allows writing projenrc files in java.
 *
 * This will install `org.projen/projen` as a Maven dependency and will add a
 * `synth` task which will compile & execute `main()` from
 * `src/main/java/projenrc.java`.
 */
export declare class Projenrc extends ProjenrcFile {
    /**
     * The name of the java class that includes the projen entrypoint.
     */
    readonly className: string;
    /**
     * Whether the class is in the "test" or "main" scope?
     */
    private readonly testScope;
    constructor(project: Project, pom: Pom, options?: ProjenrcOptions);
    private get javaClass();
    private get javaPackage();
    /**
     * The path of the projenrc file.
     */
    get filePath(): string;
    private generateProjenrc;
}
export declare function generateJavaOptionNames(options: ProjectOption[], jsiiManifest: any): Record<string, string>;
export declare function getJavaImport(jsiiType: any, jsiiManifest: any): string;
