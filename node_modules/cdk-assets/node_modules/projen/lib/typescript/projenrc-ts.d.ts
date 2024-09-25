import { TypescriptConfig } from "../javascript";
import { Project } from "../project";
import { ProjenrcFile } from "../projenrc";
export interface ProjenrcTsOptions {
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
     * The name of the tsconfig file that will be used by ts-node
     * when compiling projen source files.
     *
     * @default "tsconfig.projen.json"
     */
    readonly tsconfigFileName?: string;
}
/**
 * A projenrc file written in TypeScript
 *
 * This component can be instantiated in any type of project
 * and has no expectations around the project's main language.
 *
 * Requires that `npx` is available.
 */
export declare class ProjenrcTs extends ProjenrcFile {
    /**
     * TypeScript configuration file used to compile projen source files
     */
    readonly tsconfig: TypescriptConfig;
    readonly filePath: string;
    private readonly _projenCodeDir;
    constructor(project: Project, options?: ProjenrcTsOptions);
    preSynthesize(): void;
    private generateProjenrc;
}
