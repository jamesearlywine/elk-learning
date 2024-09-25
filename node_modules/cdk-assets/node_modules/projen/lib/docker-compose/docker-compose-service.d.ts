import { DockerComposeBuild } from "./docker-compose";
import { IDockerComposeNetworkBinding } from "./docker-compose-network";
import { DockerComposePortMappingOptions, DockerComposeServicePort } from "./docker-compose-port";
import { IDockerComposeVolumeBinding } from "./docker-compose-volume";
/**
 * An interface providing the name of a docker compose service.
 */
export interface IDockerComposeServiceName {
    /**
     * The name of the docker compose service.
     */
    readonly serviceName: string;
}
/**
 * A docker-compose service.
 */
export declare class DockerComposeService implements IDockerComposeServiceName {
    /**
     * Name of the service.
     */
    readonly serviceName: string;
    /**
     * Docker image.
     */
    readonly image?: string;
    /**
     * Docker image build instructions.
     */
    readonly imageBuild?: DockerComposeBuild;
    /**
     * Command to run in the container.
     */
    readonly command?: string[];
    /**
     * Entrypoint to run in the container.
     */
    readonly entrypoint?: string[];
    /**
     * Other services that this service depends on.
     */
    readonly dependsOn: IDockerComposeServiceName[];
    /**
     * Volumes mounted in the container.
     */
    readonly volumes: IDockerComposeVolumeBinding[];
    /**
     * Networks mounted in the container.
     */
    readonly networks: IDockerComposeNetworkBinding[];
    /**
     * Published ports.
     */
    readonly ports: DockerComposeServicePort[];
    /**
     * Environment variables.
     */
    readonly environment: Record<string, string>;
    /**
     * Attached labels.
     */
    readonly labels: Record<string, string>;
    /**
     * Target platform
     */
    readonly platform?: string;
    /**
     * Run in privileged mode
     */
    readonly privileged?: boolean;
    constructor(serviceName: string, serviceDescription: DockerComposeServiceDescription);
    /**
     * Add a port mapping
     * @param publishedPort Published port number
     * @param targetPort Container's port number
     * @param options Port mapping options
     */
    addPort(publishedPort: number, targetPort: number, options?: DockerComposePortMappingOptions): void;
    /**
     * Add an environment variable
     * @param name environment variable name
     * @param value value of the environment variable
     */
    addEnvironment(name: string, value: string): void;
    /**
     * Make the service depend on another service.
     * @param serviceName
     */
    addDependsOn(serviceName: IDockerComposeServiceName): void;
    /**
     * Add a volume to the service.
     * @param volume
     */
    addVolume(volume: IDockerComposeVolumeBinding): void;
    /**
     * Add a network to the service.
     * @param network
     */
    addNetwork(network: IDockerComposeNetworkBinding): void;
    /**
     * Add a label
     * @param name environment variable name
     * @param value value of the environment variable
     */
    addLabel(name: string, value: string): void;
}
/**
 * Description of a docker-compose.yml service.
 */
export interface DockerComposeServiceDescription {
    /**
     * Use a docker image.
     * Note: You must specify either `build` or `image` key.
     * @see imageBuild
     */
    readonly image?: string;
    /**
     * Build a docker image.
     * Note: You must specify either `imageBuild` or `image` key.
     * @see image
     */
    readonly imageBuild?: DockerComposeBuild;
    /**
     * Provide a command to the docker container.
     * @default - use the container's default command
     */
    readonly command?: string[];
    /**
     * Entrypoint to run in the container.
     */
    readonly entrypoint?: string[];
    /**
     * Names of other services this service depends on.
     * @default - no dependencies
     */
    readonly dependsOn?: IDockerComposeServiceName[];
    /**
     * Mount some volumes into the service.
     * Use one of the following to create volumes:
     * @see DockerCompose.bindVolume() to mount a host path
     * @see DockerCompose.namedVolume() to create & mount a named volume
     */
    readonly volumes?: IDockerComposeVolumeBinding[];
    /**
     * Add some networks to the service.
     * @see DockerCompose.network() to create & mount a named network
     */
    readonly networks?: IDockerComposeNetworkBinding[];
    /**
     * Map some ports.
     * @default - no ports are mapped
     */
    readonly ports?: DockerComposeServicePort[];
    /**
     * Add environment variables.
     * @default - no environment variables are provided
     */
    readonly environment?: Record<string, string>;
    /**
     * Add labels.
     * @default - no labels are provided
     */
    readonly labels?: Record<string, string>;
    /**
     * Add platform
     * @default - no platform is provided
     */
    readonly platform?: string;
    /**
     * Run in privileged mode
     * @default - no privileged mode flag is provided
     */
    readonly privileged?: boolean;
}
