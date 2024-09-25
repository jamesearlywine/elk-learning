import { Component } from "../component";
import { JsonFile } from "../json";
import { Project } from "../project";
/**
 * Common options for `cdk.json`.
 */
export interface CdkConfigCommonOptions {
    /**
     * Additional context to include in `cdk.json`.
     *
     * @default - no additional context
     */
    readonly context?: {
        [key: string]: any;
    };
    /**
     * Include all feature flags in cdk.json
     *
     * @default true
     */
    readonly featureFlags?: boolean;
    /**
     * To protect you against unintended changes that affect your security posture,
     * the AWS CDK Toolkit prompts you to approve security-related changes before deploying them.
     *
     * @default ApprovalLevel.BROADENING
     */
    readonly requireApproval?: ApprovalLevel;
    /**
     * cdk.out directory.
     *
     * @default "cdk.out"
     */
    readonly cdkout?: string;
    /**
     * A command to execute before synthesis. This command will be called when
     * running `cdk synth` or when `cdk watch` identifies a change in your source
     * code before redeployment.
     *
     * @default - no build command
     */
    readonly buildCommand?: string;
    /**
     * Glob patterns to include in `cdk watch`.
     *
     * @default []
     */
    readonly watchIncludes?: string[];
    /**
     * Glob patterns to exclude from `cdk watch`.
     *
     * @default []
     */
    readonly watchExcludes?: string[];
}
/**
 * Options for `CdkJson`.
 */
export interface CdkConfigOptions extends CdkConfigCommonOptions {
    /**
     * The command line to execute in order to synthesize the CDK application
     * (language specific).
     */
    readonly app: string;
}
/**
 * Represents cdk.json file.
 */
export declare class CdkConfig extends Component {
    /**
     * Represents the JSON file.
     */
    readonly json: JsonFile;
    /**
     * Name of the cdk.out directory.
     */
    readonly cdkout: string;
    /**
     * List of glob patterns to be included by CDK.
     */
    private readonly _include;
    /**
     * List of glob patterns to be excluded by CDK.
     */
    private readonly _exclude;
    constructor(project: Project, options: CdkConfigOptions);
    /**
     * Add includes to `cdk.json`.
     * @param patterns The includes to add.
     */
    addIncludes(...patterns: string[]): void;
    /**
     * Add excludes to `cdk.json`.
     * @param patterns The excludes to add.
     */
    addExcludes(...patterns: string[]): void;
    /**
     * List of glob patterns to be included by CDK.
     */
    get include(): string[];
    /**
     * List of glob patterns to be excluded by CDK.
     */
    get exclude(): string[];
}
/**
 * Which approval is required when deploying CDK apps.
 */
export declare enum ApprovalLevel {
    /**
     * Approval is never required
     */
    NEVER = "never",
    /**
     * Requires approval on any IAM or security-group-related change
     */
    ANY_CHANGE = "any-change",
    /**
     * Requires approval when IAM statements or traffic rules are added; removals don't require approval
     */
    BROADENING = "broadening"
}
