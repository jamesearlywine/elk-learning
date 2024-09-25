import { Project } from "./project";
import { ProjenrcFile } from "./projenrc";
export interface ProjenrcJsonOptions {
    /**
     * The name of the projenrc file.
     * @default ".projenrc.json"
     */
    readonly filename?: string;
}
/**
 * Sets up a project to use JSON for projenrc.
 */
export declare class ProjenrcJson extends ProjenrcFile {
    readonly filePath: string;
    constructor(project: Project, options?: ProjenrcJsonOptions);
    private generateProjenrc;
}
/**
 * @deprecated use `ProjenrcJsonOptions`
 */
export interface ProjenrcOptions extends ProjenrcJsonOptions {
}
/**
 * @deprecated use `ProjenrcJson`
 */
export declare class Projenrc extends ProjenrcJson {
}
