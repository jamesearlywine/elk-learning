import { Project } from "../project";
import { ProjenrcFile } from "../projenrc";
/**
 * Options for `Projenrc`.
 */
export interface ProjenrcOptions {
    /**
     * The name of the projenrc file.
     * @default ".projenrc.py"
     */
    readonly filename?: string;
    /**
     * The projen version to use
     * @default - current version
     */
    readonly projenVersion?: string;
    /**
     * Path to the python executable to use.
     * @default "python"
     */
    readonly pythonExec?: string;
}
/**
 * Allows writing projenrc files in python.
 *
 * This will install `projen` as a Python dependency and will add a
 * `synth` task which will run `.projenrc.py`.
 */
export declare class Projenrc extends ProjenrcFile {
    /**
     * The name of the projenrc file.
     */
    readonly filePath: string;
    /**
     * Path to the python executable to use.
     */
    readonly pythonExec: string;
    constructor(project: Project, options?: ProjenrcOptions);
    private generateProjenrc;
}
export declare function resolvePythonImportName(jsiiFqn: string, jsiiManifest: any): string;
