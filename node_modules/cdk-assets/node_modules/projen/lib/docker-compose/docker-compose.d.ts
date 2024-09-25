import { DockerComposeNetworkConfig, IDockerComposeNetworkBinding } from "./docker-compose-network";
import { DockerComposePortMappingOptions, DockerComposeServicePort } from "./docker-compose-port";
import { DockerComposeService, DockerComposeServiceDescription, IDockerComposeServiceName } from "./docker-compose-service";
import { DockerComposeVolumeConfig, IDockerComposeVolumeBinding } from "./docker-compose-volume";
import { Component } from "../component";
import { Project } from "../project";
import { YamlFile } from "../yaml";
/**
 * Props for DockerCompose.
 */
export interface DockerComposeProps {
    /**
     * A name to add to the docker-compose.yml filename.
     * @example 'myname' yields 'docker-compose.myname.yml'
     * @default - no name is added
     */
    readonly nameSuffix?: string;
    /**
     * Docker Compose schema version do be used
     * @default - no version is provided
     * @deprecated - The top level `version` field is obsolete per the Compose Specification.
     * {@link https://github.com/compose-spec/compose-spec/blob/master/spec.md#version-and-name-top-level-elements Compose Specification}
     */
    readonly schemaVersion?: string;
    /**
     * Service descriptions.
     */
    readonly services?: Record<string, DockerComposeServiceDescription>;
}
/**
 * Create a docker-compose YAML file.
 */
export declare class DockerCompose extends Component {
    /**
     * Depends on a service name.
     */
    static serviceName(serviceName: string): IDockerComposeServiceName;
    /**
     * Create a port mapping.
     * @param publishedPort Published port number
     * @param targetPort Container's port number
     * @param options Port mapping options
     */
    static portMapping(publishedPort: number, targetPort: number, options?: DockerComposePortMappingOptions): DockerComposeServicePort;
    /**
     * Create a bind volume that binds a host path to the target path in the container.
     * @param sourcePath Host path name
     * @param targetPath Target path name
     */
    static bindVolume(sourcePath: string, targetPath: string): IDockerComposeVolumeBinding;
    /**
     * Create a named volume and mount it to the target path. If you use this
     * named volume in several services, the volume will be shared. In this
     * case, the volume configuration of the first-provided options are used.
     *
     * @param volumeName Name of the volume
     * @param targetPath Target path
     * @param options volume configuration (default: docker compose defaults)
     */
    static namedVolume(volumeName: string, targetPath: string, options?: DockerComposeVolumeConfig): IDockerComposeVolumeBinding;
    /**
     * Create a named network and mount it to the target path. If you use this
     * named network in several services, the network will be shared. In this
     * case, the network configuration of the first-provided options are used.
     *
     * @param networkName Name of the network
     * @param options network configuration
     */
    static network(networkName: string, options?: DockerComposeNetworkConfig): IDockerComposeNetworkBinding;
    /**
     * The Docker Compose file
     */
    readonly file: YamlFile;
    private readonly services;
    private readonly version?;
    constructor(project: Project, props?: DockerComposeProps);
    /**
     * Add a service to the docker-compose file.
     * @param serviceName name of the service
     * @param description a service description
     */
    addService(serviceName: string, description: DockerComposeServiceDescription): DockerComposeService;
    /**
     * @internal
     */
    _synthesizeDockerCompose(): object;
}
/**
 * Build arguments for creating a docker image.
 */
export interface DockerComposeBuild {
    /**
     * Docker build context directory.
     */
    readonly context: string;
    /**
     * A dockerfile to build from.
     * @default "Dockerfile"
     */
    readonly dockerfile?: string;
    /**
     * Build args.
     * @default - none are provided
     */
    readonly args?: Record<string, string>;
}
