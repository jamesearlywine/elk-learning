import { Construct, IConstruct } from "constructs";
import { Component } from "./component";
import { Dependencies } from "./dependencies";
import { FileBase } from "./file";
import { EndOfLine, GitAttributesFile } from "./gitattributes";
import { IgnoreFile, IgnoreFileOptions } from "./ignore-file";
import * as inventory from "./inventory";
import { JsonFile } from "./json";
import { Logger, LoggerOptions } from "./logger";
import { ObjectFile } from "./object-file";
import { InitProjectOptionHints } from "./option-hints";
import { ProjectBuild as ProjectBuild } from "./project-build";
import { ProjenrcJsonOptions } from "./projenrc-json";
import { RenovatebotOptions } from "./renovatebot";
import { Task, TaskOptions } from "./task";
import { Tasks } from "./tasks";
/**
 * Options for `Project`.
 */
export interface ProjectOptions {
    /**
     * This is the name of your project.
     *
     * @default $BASEDIR
     * @featured
     */
    readonly name: string;
    /**
     * The parent project, if this project is part of a bigger project.
     */
    readonly parent?: Project;
    /**
     * The root directory of the project.
     *
     * Relative to this directory, all files are synthesized.
     *
     * If this project has a parent, this directory is relative to the parent
     * directory and it cannot be the same as the parent or any of it's other
     * subprojects.
     *
     * @default "."
     */
    readonly outdir?: string;
    /**
     * Configure logging options such as verbosity.
     * @default {}
     */
    readonly logging?: LoggerOptions;
    /**
     * Generate (once) .projenrc.json (in JSON). Set to `false` in order to disable
     * .projenrc.json generation.
     *
     * @default false
     */
    readonly projenrcJson?: boolean;
    /**
     * Options for .projenrc.json
     * @default - default options
     */
    readonly projenrcJsonOptions?: ProjenrcJsonOptions;
    /**
     * The shell command to use in order to run the projen CLI.
     *
     * Can be used to customize in special environments.
     *
     * @default "npx projen"
     */
    readonly projenCommand?: string;
    /**
     * Use renovatebot to handle dependency upgrades.
     *
     * @default false
     */
    readonly renovatebot?: boolean;
    /**
     * Options for renovatebot.
     *
     * @default - default options
     */
    readonly renovatebotOptions?: RenovatebotOptions;
    /**
     * Whether to commit the managed files by default.
     *
     * @default true
     */
    readonly commitGenerated?: boolean;
    /**
     * Configuration options for git
     */
    readonly gitOptions?: GitOptions;
    /**
     * Configuration options for .gitignore file
     */
    readonly gitIgnoreOptions?: IgnoreFileOptions;
}
/**
 * Git configuration options
 */
export interface GitOptions {
    /**
     * File patterns to mark as stored in Git LFS
     *
     * @default - No files stored in LFS
     */
    readonly lfsPatterns?: string[];
    /**
     * The default end of line character for text files.
     *
     * endOfLine it's useful to keep the same end of line between Windows and Unix operative systems for git checking/checkout operations.
     * Hence, it can avoid simple repository mutations consisting only of changes in the end of line characters.
     * It will be set in the first line of the .gitattributes file to make it the first match with high priority but it can be overriden in a later line.
     * Can be disabled by setting: `endOfLine: EndOfLine.NONE`.
     *
     * @default EndOfLine.LF
     */
    readonly endOfLine?: EndOfLine;
}
/**
 * Base project
 */
export declare class Project extends Construct {
    /**
     * The name of the default task (the task executed when `projen` is run without arguments). Normally
     * this task should synthesize the project files.
     */
    static readonly DEFAULT_TASK = "default";
    /**
     * Test whether the given construct is a project.
     */
    static isProject(x: any): x is Project;
    /**
     * Find the closest ancestor project for given construct.
     * When given a project, this it the project itself.
     *
     * @throws when no project is found in the path to the root
     */
    static of(construct: IConstruct): Project;
    /**
     * Project name.
     */
    readonly name: string;
    /**
     * .gitignore
     */
    readonly gitignore: IgnoreFile;
    /**
     * The .gitattributes file for this repository.
     */
    readonly gitattributes: GitAttributesFile;
    /**
     * A parent project. If undefined, this is the root project.
     */
    readonly parent?: Project;
    /**
     * Absolute output directory of this project.
     */
    readonly outdir: string;
    /**
     * Project tasks.
     */
    readonly tasks: Tasks;
    /**
     * Project dependencies.
     */
    readonly deps: Dependencies;
    /**
     * Logging utilities.
     */
    readonly logger: Logger;
    /**
     * The options used when this project is bootstrapped via `projen new`. It
     * includes the original set of options passed to the CLI and also the JSII
     * FQN of the project type.
     */
    readonly initProject?: InitProject;
    /**
     * The command to use in order to run the projen CLI.
     */
    get projenCommand(): string;
    /**
     * This is the "default" task, the one that executes "projen". Undefined if
     * the project is being ejected.
     */
    readonly defaultTask?: Task;
    /**
     * This task ejects the project from projen. This is undefined if the project
     * it self is being ejected.
     *
     * See docs for more information.
     */
    private readonly ejectTask?;
    /**
     * Manages the build process of the project.
     */
    readonly projectBuild: ProjectBuild;
    /**
     * Whether to commit the managed files by default.
     */
    readonly commitGenerated: boolean;
    private readonly tips;
    private readonly excludeFromCleanup;
    private readonly _ejected;
    /** projenCommand without default value */
    private readonly _projenCommand?;
    constructor(options: ProjectOptions);
    /**
     * The root project.
     */
    get root(): Project;
    /**
     * Returns all the components within this project.
     */
    get components(): Component[];
    /**
     * Returns all the subprojects within this project.
     */
    get subprojects(): Project[];
    /**
     * All files in this project.
     */
    get files(): FileBase[];
    /**
     * Adds a new task to this project. This will fail if the project already has
     * a task with this name.
     *
     * @param name The task name to add
     * @param props Task properties
     */
    addTask(name: string, props?: TaskOptions): Task;
    /**
     * Removes a task from a project.
     *
     * @param name The name of the task to remove.
     *
     * @returns The `Task` that was removed, otherwise `undefined`.
     */
    removeTask(name: string): Task | undefined;
    get buildTask(): Task;
    get compileTask(): Task;
    get testTask(): Task;
    get preCompileTask(): Task;
    get postCompileTask(): Task;
    get packageTask(): Task;
    /**
     * Finds a file at the specified relative path within this project and all
     * its subprojects.
     *
     * @param filePath The file path. If this path is relative, it will be resolved
     * from the root of _this_ project.
     * @returns a `FileBase` or undefined if there is no file in that path
     */
    tryFindFile(filePath: string): FileBase | undefined;
    /**
     * Finds a json file by name.
     * @param filePath The file path.
     * @deprecated use `tryFindObjectFile`
     */
    tryFindJsonFile(filePath: string): JsonFile | undefined;
    /**
     * Finds an object file (like JsonFile, YamlFile, etc.) by name.
     * @param filePath The file path.
     */
    tryFindObjectFile(filePath: string): ObjectFile | undefined;
    /**
     * Finds a file at the specified relative path within this project and removes
     * it.
     *
     * @param filePath The file path. If this path is relative, it will be
     * resolved from the root of _this_ project.
     * @returns a `FileBase` if the file was found and removed, or undefined if
     * the file was not found.
     */
    tryRemoveFile(filePath: string): FileBase | undefined;
    /**
     * Prints a "tip" message during synthesis.
     * @param message The message
     * @deprecated - use `project.logger.info(message)` to show messages during synthesis
     */
    addTip(message: string): void;
    /**
     * Exclude the matching files from pre-synth cleanup. Can be used when, for example, some
     * source files include the projen marker and we don't want them to be erased during synth.
     *
     * @param globs The glob patterns to match
     */
    addExcludeFromCleanup(...globs: string[]): void;
    /**
     * Returns the shell command to execute in order to run a task.
     *
     * By default, this is `npx projen@<version> <task>`
     *
     * @param task The task for which the command is required
     */
    runTaskCommand(task: Task): string;
    /**
     * Exclude these files from the bundled package. Implemented by project types based on the
     * packaging mechanism. For example, `NodeProject` delegates this to `.npmignore`.
     *
     * @param _pattern The glob pattern to exclude
     */
    addPackageIgnore(_pattern: string): void;
    /**
     * Adds a .gitignore pattern.
     * @param pattern The glob pattern to ignore.
     */
    addGitIgnore(pattern: string): void;
    /**
     * Consider a set of files as "generated". This method is implemented by
     * derived classes and used for example, to add git attributes to tell GitHub
     * that certain files are generated.
     *
     * @param _glob the glob pattern to match (could be a file path).
     */
    annotateGenerated(_glob: string): void;
    /**
     * Synthesize all project files into `outdir`.
     *
     * 1. Call "this.preSynthesize()"
     * 2. Delete all generated files
     * 3. Synthesize all subprojects
     * 4. Synthesize all components of this project
     * 5. Call "postSynthesize()" for all components of this project
     * 6. Call "this.postSynthesize()"
     */
    synth(): void;
    /**
     * Whether or not the project is being ejected.
     */
    get ejected(): boolean;
    /**
     * Called before all components are synthesized.
     */
    preSynthesize(): void;
    /**
     * Called after all components are synthesized. Order is *not* guaranteed.
     */
    postSynthesize(): void;
}
/**
 * Which type of project this is.
 *
 * @deprecated no longer supported at the base project level
 */
export declare enum ProjectType {
    /**
     * This module may be a either a library or an app.
     */
    UNKNOWN = "unknown",
    /**
     * This is a library, intended to be published to a package manager and
     * consumed by other projects.
     */
    LIB = "lib",
    /**
     * This is an app (service, tool, website, etc). Its artifacts are intended to
     * be deployed or published for end-user consumption.
     */
    APP = "app"
}
/**
 * Information passed from `projen new` to the project object when the project
 * is first created. It is used to generate projenrc files in various languages.
 */
export interface InitProject {
    /**
     * The JSII FQN of the project type.
     */
    readonly fqn: string;
    /**
     * Initial arguments passed to `projen new`.
     */
    readonly args: Record<string, any>;
    /**
     * Project metadata.
     */
    readonly type: inventory.ProjectType;
    /**
     * Include commented out options. Does not apply to projenrc.json files.
     * @default InitProjectOptionHints.FEATURED
     */
    readonly comments: InitProjectOptionHints;
}
