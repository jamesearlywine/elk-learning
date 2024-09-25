import { Construct, IConstruct } from "constructs";
import { Project } from "./project";
/**
 * Represents a project component.
 * @param project
 * @param id Unique id of the component. If not provided, an unstable AutoId is generated.
 */
export declare class Component extends Construct {
    /**
     * Test whether the given construct is a component.
     */
    static isComponent(x: any): x is Component;
    readonly project: Project;
    constructor(scope: IConstruct, id?: string);
    /**
     * Called before synthesis.
     */
    preSynthesize(): void;
    /**
     * Synthesizes files to the project output directory.
     */
    synthesize(): void;
    /**
     * Called after synthesis. Order is *not* guaranteed.
     */
    postSynthesize(): void;
}
