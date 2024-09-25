import { ProjenrcFile } from "../projenrc";
import { TypeScriptProject } from "../typescript";
export interface ProjenrcOptions {
    /**
     * The name of the projenrc file.
     * @default ".projenrc.ts"
     */
    readonly filename?: string;
    /**
     * A directory tree that may contain *.ts files that can be referenced from
     * your projenrc typescript file.
     *
     * @default "projenrc"
     */
    readonly projenCodeDir?: string;
    /**
     * Whether to use `SWC` for ts-node.
     *
     * @default false
     */
    readonly swc?: boolean;
}
/**
 * Sets up a typescript project to use TypeScript for projenrc.
 */
export declare class Projenrc extends ProjenrcFile {
    readonly filePath: string;
    private readonly _projenCodeDir;
    private readonly _tsProject;
    private readonly _swc;
    constructor(project: TypeScriptProject, options?: ProjenrcOptions);
    private addDefaultTask;
    preSynthesize(): void;
    private generateProjenrc;
}
