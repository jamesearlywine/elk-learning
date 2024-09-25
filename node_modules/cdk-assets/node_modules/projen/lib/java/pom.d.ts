import { Component } from "../component";
import { Project } from "../project";
/**
 * Options for `Pom`.
 */
export interface PomOptions {
    /**
     * This is generally unique amongst an organization or a project. For example,
     * all core Maven artifacts do (well, should) live under the groupId
     * org.apache.maven. Group ID's do not necessarily use the dot notation, for
     * example, the junit project. Note that the dot-notated groupId does not have
     * to correspond to the package structure that the project contains. It is,
     * however, a good practice to follow. When stored within a repository, the
     * group acts much like the Java packaging structure does in an operating
     * system. The dots are replaced by OS specific directory separators (such as
     * '/' in Unix) which becomes a relative directory structure from the base
     * repository. In the example given, the org.codehaus.mojo group lives within
     * the directory $M2_REPO/org/codehaus/mojo.
     * @default "org.acme"
     * @featured
     */
    readonly groupId: string;
    /**
     * The artifactId is generally the name that the project is known by. Although
     * the groupId is important, people within the group will rarely mention the
     * groupId in discussion (they are often all be the same ID, such as the
     * MojoHaus project groupId: org.codehaus.mojo). It, along with the groupId,
     * creates a key that separates this project from every other project in the
     * world (at least, it should :) ). Along with the groupId, the artifactId
     * fully defines the artifact's living quarters within the repository. In the
     * case of the above project, my-project lives in
     * $M2_REPO/org/codehaus/mojo/my-project.
     * @default "my-app"
     * @featured
     */
    readonly artifactId: string;
    /**
     * This is the last piece of the naming puzzle. groupId:artifactId denotes a
     * single project but they cannot delineate which incarnation of that project
     * we are talking about. Do we want the junit:junit of 2018 (version 4.12), or
     * of 2007 (version 3.8.2)? In short: code changes, those changes should be
     * versioned, and this element keeps those versions in line. It is also used
     * within an artifact's repository to separate versions from each other.
     * my-project version 1.0 files live in the directory structure
     * $M2_REPO/org/codehaus/mojo/my-project/1.0.
     * @default "0.1.0"
     * @featured
     */
    readonly version: string;
    /**
     * Project packaging format.
     *
     * @default "jar"
     */
    readonly packaging?: string;
    /**
     * Description of a project is always good. Although this should not replace
     * formal documentation, a quick comment to any readers of the POM is always
     * helpful.
     *
     * @default undefined
     * @featured
     */
    readonly description?: string;
    /**
     * The URL, like the name, is not required. This is a nice gesture for
     * projects users, however, so that they know where the project lives.
     *
     * @default undefined
     * @featured
     */
    readonly url?: string;
    /**
     * A Parent Pom can be used to have a child project inherit
     * properties/plugins/ect in order to reduce duplication and keep standards
     * across a large amount of repos
     *
     * @default undefined
     * @featured
     */
    readonly parentPom?: ParentPom;
}
export interface ParentPom {
    /**
     * Parent Pom Group ID
     */
    readonly groupId?: string;
    /**
     * Parent Pom Artifact ID
     */
    readonly artifactId?: string;
    /**
     * Parent Pom Version
     */
    readonly version?: string;
    /**
     * Parent Pom Relative path from the current pom
     */
    readonly relativePath?: string;
}
/**
 * Represents a Maven repository
 * @see https://maven.apache.org/guides/introduction/introduction-to-repositories.html
 */
export interface MavenRepository {
    /**
     * The identifier for the repository
     */
    readonly id: string;
    /**
     * The url of the repository
     */
    readonly url: string;
    /**
     * The name of the repository
     */
    readonly name?: string;
    /**
     * The layout of the repository
     */
    readonly layout?: string;
    /**
     * Repository Policy for Snapshots
     */
    readonly snapshots?: MavenRepositoryPolicy;
    /**
     * Repository Policy for Releases
     */
    readonly releases?: MavenRepositoryPolicy;
}
/**
 * Represents a Maven Repository Policy
 * @see https://maven.apache.org/settings.html#repositories
 */
export interface MavenRepositoryPolicy {
    readonly enabled?: boolean;
    /**
     * Update Policy
     * This element specifies how often updates should attempt to occur. Maven will compare the local POM's timestamp (stored in a repository's maven-metadata file) to the remote.
     * @default UpdatePolicy.DAILY
     */
    readonly updatePolicy?: UpdatePolicy;
    /**
     * Checksum Policy
     * When Maven deploys files to the repository, it also deploys corresponding checksum files.
     */
    readonly checksumPolicy?: ChecksumPolicy;
}
export declare class UpdatePolicy {
    static readonly ALWAYS = "always";
    static readonly DAILY = "daily";
    static readonly NEVER = "never";
    /**
     * Updates at an interval of X minutes.
     */
    static interval(minutes: number): string;
}
export declare enum ChecksumPolicy {
    IGNORE = "ignore",
    FAIL = "fail",
    WARN = "warn"
}
/**
 * A Project Object Model or POM is the fundamental unit of work in Maven. It is
 * an XML file that contains information about the project and configuration
 * details used by Maven to build the project.
 */
export declare class Pom extends Component {
    /**
     * The name of the pom file.
     */
    readonly fileName: string;
    /**
     * Maven group ID.
     */
    readonly groupId: string;
    /**
     * Maven artifact ID.
     */
    readonly artifactId: string;
    /**
     * Project version.
     */
    readonly version: string;
    /**
     * Maven packaging format.
     */
    readonly packaging: string;
    /**
     * Project display name.
     */
    readonly name?: string;
    /**
     * Project description.
     */
    readonly description?: string;
    /**
     * Project URL.
     */
    readonly url?: string;
    private readonly parentPom?;
    private readonly properties;
    private readonly repositories;
    private readonly pluginRepositories;
    constructor(project: Project, options: PomOptions);
    /**
     * Adds a key/value property to the pom.
     * @param key the key
     * @param value the value
     */
    addProperty(key: string, value: string): void;
    /**
     * Adds a runtime dependency.
     *
     * @param spec Format `<groupId>/<artifactId>@<semver>`
     */
    addDependency(spec: string): void;
    /**
     * Adds a test dependency.
     *
     * @param spec Format `<groupId>/<artifactId>@<semver>`
     */
    addTestDependency(spec: string): void;
    /**
     * Adds a build plugin to the pom.
     *
     * The plug in is also added as a BUILD dep to the project.
     *
     * @param spec dependency spec (`group/artifact@version`)
     * @param options plugin options
     */
    addPlugin(spec: string, options?: PluginOptions): import("../dependencies").Dependency;
    /**
     * Adds a repository to the pom
     * @param repository the repository to add
     */
    addRepository(repository: MavenRepository): void;
    addPluginRepository(repository: MavenRepository): void;
    private synthPom;
    private synthDependencies;
    private synthRepositories;
    private synthPluginRepositories;
}
/**
 * Options for Maven plugins.
 */
export interface PluginOptions {
    /**
     * Plugin key/value configuration
     * @default {}
     */
    readonly configuration?: {
        [key: string]: any;
    };
    /**
     * Plugin executions
     * @default []
     */
    readonly executions?: PluginExecution[];
    /**
     * You could configure the dependencies for the plugin.
     *
     * Dependencies are in `<groupId>/<artifactId>@<semver>` format.
     *
     * @default []
     */
    readonly dependencies?: string[];
}
/**
 * Plugin execution definition.
 */
export interface PluginExecution {
    /**
     * The ID.
     */
    readonly id: string;
    /**
     * Which Maven goals this plugin should be associated with.
     */
    readonly goals: string[];
    /**
     * The phase in which the plugin should execute.
     */
    readonly phase?: string;
    /**
     * Execution key/value configuration
     * @default {}
     */
    readonly configuration?: {
        [key: string]: any;
    };
}
