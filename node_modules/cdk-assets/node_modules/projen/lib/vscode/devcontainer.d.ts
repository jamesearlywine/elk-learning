import { Component } from "../component";
import { DevEnvironmentDockerImage, DevEnvironmentOptions, IDevEnvironment } from "../dev-env";
import { Project } from "../project";
import { Task } from "../task";
/**
 * devcontainer features options
 * @see https://containers.dev/implementors/features/#devcontainer-json-properties
 */
export interface DevContainerFeature {
    /**
     * feature name
     */
    readonly name: string;
    /**
     * feature version
     * @default latest
     */
    readonly version?: string;
}
/**
 * Constructor options for the DevContainer component.
 *
 * The default docker image used for GitHub Codespaces is defined here:
 * @see https://github.com/microsoft/vscode-dev-containers/tree/master/containers/codespaces-linux
 */
export interface DevContainerOptions extends DevEnvironmentOptions {
    /**
     * An array of VSCode features that specify the features that should be
     * installed inside the container when it is created.
     */
    readonly features?: DevContainerFeature[];
}
export interface IDevContainerEnvironment extends IDevEnvironment {
    /**
     * Adds a list of VSCode features that should be automatically installed
     * in the container.
     *
     * @param features featureName and version(optional default: latest)
     */
    addFeatures(...features: DevContainerFeature[]): void;
}
/**
 * A development environment running VSCode in a container; used by GitHub
 * codespaces.
 */
export declare class DevContainer extends Component implements IDevContainerEnvironment {
    private dockerImage;
    private readonly postCreateTasks;
    private readonly ports;
    private readonly vscodeExtensions;
    private readonly features;
    /**
     * Direct access to the devcontainer configuration (escape hatch)
     */
    readonly config: any;
    constructor(project: Project, options?: DevContainerOptions);
    addDockerImage(image: DevEnvironmentDockerImage): void;
    /**
     * Adds tasks to run when the container starts. Tasks will be run in sequence.
     *
     * @param tasks The new tasks
     */
    addTasks(...tasks: Task[]): void;
    /**
     * Adds ports that should be exposed (forwarded) from the container.
     *
     * @param ports The new ports
     */
    addPorts(...ports: string[]): void;
    /**
     * Adds a list of VSCode extensions that should be automatically installed
     * in the container.
     *
     * @param extensions The extension IDs
     */
    addVscodeExtensions(...extensions: string[]): void;
    /**
     * Adds a list of VSCode features that should be automatically installed
     * in the container.
     *
     * @param features featureName and version(optional default: latest)
     */
    addFeatures(...features: DevContainerFeature[]): void;
    private renderTasks;
    private renderFeatures;
}
