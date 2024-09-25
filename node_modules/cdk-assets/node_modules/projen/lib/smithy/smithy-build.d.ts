import { Component } from "../component";
import { MavenRepository } from "../java";
import { Project } from "../project";
type Transform = {
    name: string;
    args: Record<string, any>;
};
type SmithyCommon = {
    imports?: string[];
    plugins?: PluginsType;
};
type PluginValue = {
    service?: string;
    [key: string]: any;
};
export type ProjectionValue = SmithyCommon & {
    abstract?: boolean;
    transforms?: Transform[];
};
export type ProjectionKey = string;
export type ProjectionsType = Record<ProjectionKey, ProjectionValue>;
export type PluginKey = string;
export type PluginsType = Record<PluginKey, PluginValue>;
/**
 * Maven repository definition for a smithy build file
 */
export type SmithyMavenRepository = Partial<MavenRepository> & Pick<MavenRepository, "url">;
export interface SmithyMavenConfig {
    /**
     * List of smithy dependencies, for example ["software.amazon.smithy:smithy-cli:1.27.2"]
     */
    readonly dependencies: string[];
    /**
     * List of maven repositories for smithy dependencies
     */
    readonly repositories: SmithyMavenRepository[];
}
/**
 * Options for `SmithyBuild`
 * @see https://smithy.io/2.0/guides/building-models/build-config.html
 */
export interface SmithyBuildOptions extends SmithyCommon {
    /**
     * Defines the version of smithy-build.
     * @default "1.0"
     */
    readonly version?: string;
    /**
     * Specifies a location where smithy projections are written.
     * @default - no output directory
     */
    readonly outputDirectory?: string;
    /**
     * Map of projections name to projection configurations
     * https://awslabs.github.io/smithy/1.0/guides/building-models/build-config.html#projections
     * @default - no projections
     */
    readonly projections?: ProjectionsType;
    /**
     * If a plugin can't be found, Smithy will by default fail the build.
     * This setting can be set to true to allow the build to progress
     * even if a plugin can't be found on the classpath.
     *
     * @default - no ignoreMissingPlugins set in the smithy-build.json file
     */
    readonly ignoreMissingPlugins?: boolean;
    /**
     * Maven configuration, used to declare dependencies for the smithy vs-code plugin
     * @see https://github.com/awslabs/smithy-vscode/blob/main/README.md#authoring-a-model
     * @default - no maven configuration set in the smithy-build.json file
     */
    readonly maven?: SmithyMavenConfig;
    /**
     * Relative paths to model source files or directories
     * @default - refer to https://smithy.io/2.0/guides/building-models/gradle-plugin.html?highlight=source#smithy-model-sources
     */
    readonly sources?: string[];
}
/**
 * Smithy build configuration options
 * @see https://smithy.io/2.0/guides/building-models/build-config.html
 */
export declare class SmithyBuild extends Component {
    /**
     * Defines the version of smithy-build.
     * @default "1.0"
     */
    readonly version: string;
    /**
     * Specifies a location where smithy projections are written.
     * @default - no output directory
     */
    readonly outputDirectory?: string;
    /**
     * List of imports relative to the location of smithy-build.json file.
     * @default no imports
     */
    private _imports?;
    /**
     * If a plugin can't be found, Smithy will by default fail the build.
     * This setting can be set to true to allow the build to progress
     * even if a plugin can't be found on the classpath.
     *
     * @default - no ignoreMissingPlugins set in the smithy-build.json file
     */
    readonly ignoreMissingPlugins?: boolean;
    /**
     * Map of projections name to projection configurations
     * https://awslabs.github.io/smithy/1.0/guides/building-models/build-config.html#projections
     * @default - no projections
     */
    private _projections?;
    /**
     * Map of plugin name to plugin configurations
     * https://awslabs.github.io/smithy/1.0/guides/building-models/build-config.html#plugins
     * @default - no plugins
     */
    private _plugins?;
    /**
     * Maven configuration for the Smithy vs-code extension
     * https://github.com/awslabs/smithy-vscode/blob/main/README.md#authoring-a-model
     */
    private _maven?;
    /**
     * List of model source files/directories
     */
    private _sources?;
    private readonly manifest;
    constructor(project: Project, options?: SmithyBuildOptions);
    /**
     * Get configured projections
     */
    get projections(): {
        [x: string]: ProjectionValue;
    } | undefined;
    /**
     * Get configured imports
     */
    get imports(): string[] | undefined;
    /**
     * Get configured plugins
     */
    get plugins(): {
        [x: string]: PluginValue;
    } | undefined;
    /**
     * Add a smithy build import
     */
    addImport(imp: string): void;
    /**
     * Add smithy build projections
     */
    addProjections(projections: ProjectionsType): void;
    /**
     * Add smithy build plugins
     */
    addPlugins(plugins: PluginsType): void;
    /**
     * Add maven dependencies to the smithy build for the vs-code plugin
     */
    addMavenDependencies(...dependencies: string[]): void;
    /**
     * Add maven repositories to the smithy build for the vs-code plugin
     */
    addMavenRepositories(...repositories: SmithyMavenRepository[]): void;
    /**
     * Add relative paths to model source files or directories
     */
    addSources(...sources: string[]): void;
}
export {};
