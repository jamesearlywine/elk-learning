import { CheckoutWithPatchOptions, CreatePullRequestOptions } from ".";
import { Job } from "./workflows-model";
import { GroupRunnerOptions } from "../runner-options";
/**
 * A set of utility functions for creating jobs in GitHub Workflows.
 */
export declare class WorkflowJobs {
    /**
     * Creates a pull request with the changes of a patch file.
     *
     * @returns Job
     */
    static pullRequestFromPatch(options: PullRequestFromPatchOptions): Job;
}
export interface PullRequestPatchSource extends CheckoutWithPatchOptions {
    /**
     * The id of the job that created the patch file
     */
    readonly jobId: string;
    /**
     * The name of the output that indicates if a patch has been created
     */
    readonly outputName: string;
}
export interface PullRequestFromPatchOptions extends CreatePullRequestOptions {
    /**
     * Information about the patch that is used to create the pull request.
     */
    readonly patch: PullRequestPatchSource;
    /**
     * The name of the job displayed on GitHub.
     * @default "Create Pull Request"
     */
    readonly jobName?: string;
    /**
     * Github Runner selection labels
     * @default ["ubuntu-latest"]
     * @description Defines a target Runner by labels
     * @throws {Error} if both `runsOn` and `runsOnGroup` are specified
     */
    readonly runsOn?: string[];
    /**
     * Github Runner Group selection options
     * @description Defines a target Runner Group by name and/or labels
     * @throws {Error} if both `runsOn` and `runsOnGroup` are specified
     */
    readonly runsOnGroup?: GroupRunnerOptions;
}
