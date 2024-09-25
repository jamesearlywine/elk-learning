import { FileBase, FileBaseOptions, IResolver } from "./file";
import { Project } from "./project";
/**
 * A Make rule.
 */
export interface Rule {
    /**
     * Files to be created or updated by this rule.
     *
     * If the rule is phony then instead this represents the command's name(s).
     */
    readonly targets: string[];
    /**
     * Files that are used as inputs to create a target.
     *
     * @default []
     */
    readonly prerequisites?: string[];
    /**
     * Commands that are run (using prerequisites as inputs) to create a target.
     *
     * @default []
     */
    readonly recipe?: string[];
    /**
     * Marks whether the target is phony.
     *
     * @default false
     */
    readonly phony?: boolean;
}
/**
 * Options for Makefiles.
 */
export interface MakefileOptions extends FileBaseOptions {
    /**
     * List of targets to build when Make is invoked without specifying any targets.
     *
     * @default []
     */
    readonly all?: string[];
    /**
     * Rules to include in the Makefile.
     *
     * @default []
     */
    readonly rules?: Rule[];
}
/**
 * Minimal Makefile.
 */
export declare class Makefile extends FileBase {
    /**
     * List of rule definitions.
     */
    readonly rules: Rule[];
    private readonly all;
    constructor(project: Project, filePath: string, options?: MakefileOptions);
    /**
     * Add a target to all
     */
    addAll(target: string): Makefile;
    /**
     * Add multiple targets to all
     */
    addAlls(...targets: string[]): Makefile;
    /**
     * Add a rule to the Makefile.
     */
    addRule(rule: Rule): Makefile;
    /**
     * Add multiple rules to the Makefile.
     */
    addRules(...rules: Rule[]): Makefile;
    private validateRule;
    protected synthesizeContent(resolver: IResolver): string | undefined;
}
