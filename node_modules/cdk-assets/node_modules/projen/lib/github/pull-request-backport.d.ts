import { IConstruct } from "constructs";
import { GithubWorkflow } from "./workflows";
import { Component } from "../component";
import { JsonFile } from "../json";
export interface PullRequestBackportOptions {
    /**
     * The name of the workflow.
     *
     * @default "backport"
     */
    readonly workflowName?: string;
    /**
     * Should this created Backport PRs with conflicts.
     *
     * Conflicts will have to be resolved manually, but a PR is always created.
     * Set to `false` to prevent the backport PR from being created if there are conflicts.
     *
     * @default true
     */
    readonly createWithConflicts?: boolean;
    /**
     * The labels added to the created backport PR.
     *
     * @default ["backport"]
     */
    readonly backportPRLabels?: string[];
    /**
     * The prefix used to name backport branches.
     *
     * Make sure to include a separator at the end like `/` or `_`.
     *
     * @default "backport/"
     */
    readonly backportBranchNamePrefix?: string;
    /**
     * Automatically approve backport PRs if the 'auto approve' workflow is available.
     *
     * @default true
     */
    readonly autoApproveBackport?: boolean;
    /**
     * List of branches that can be a target for backports
     *
     * @default - allow backports to all release branches
     */
    readonly branches?: string[];
    /**
     * The prefix used to detect PRs that should be backported.
     *
     * @default "backport-to-"
     */
    readonly labelPrefix?: string;
}
export declare class PullRequestBackport extends Component {
    readonly file: JsonFile;
    readonly workflow: GithubWorkflow;
    constructor(scope: IConstruct, options?: PullRequestBackportOptions);
}
