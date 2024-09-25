import { Component } from "./component";
import { Project } from "./project";
/**
 * A component representing the projen runtime configuration
 */
export declare abstract class ProjenrcFile extends Component {
    /**
     * Returns the `Projenrc` instance associated with a project or `undefined` if
     * there is no Projenrc.
     * @param project The project
     * @returns A Projenrc
     */
    static of(project: Project): ProjenrcFile | undefined;
    /**
     * The path of the projenrc file.
     */
    abstract readonly filePath: string;
    preSynthesize(): void;
}
