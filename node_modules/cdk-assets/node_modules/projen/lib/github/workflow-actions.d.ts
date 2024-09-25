import { GitIdentity, GithubCredentials } from ".";
import { CheckoutWith } from "./workflow-steps";
import { JobStep } from "./workflows-model";
/**
 * A set of utility functions for creating GitHub actions in workflows.
 */
export declare class WorkflowActions {
    /**
     * Creates a .patch file from the current git diff and uploads it as an
     * artifact. Use `checkoutWithPatch` to download and apply in another job.
     *
     * If a patch was uploaded, the action can optionally fail the job.
     *
     * @param options Options
     * @returns Job steps
     */
    static uploadGitPatch(options: UploadGitPatchOptions): JobStep[];
    /**
     * Checks out a repository and applies a git patch that was created using
     * `uploadGitPatch`.
     *
     * @param options Options
     * @returns Job steps
     */
    static checkoutWithPatch(options?: CheckoutWithPatchOptions): JobStep[];
    /**
     * A step that creates a pull request based on the current repo state.
     *
     * @param options Options
     * @returns Job steps
     */
    static createPullRequest(options: CreatePullRequestOptions): JobStep[];
    /**
     * Configures the git identity (user name and email).
     * @param id The identity to use
     * @returns Job steps
     *
     * @deprecated use `WorkflowSteps.setupGitIdentity` instead
     */
    static setupGitIdentity(id: GitIdentity): JobStep[];
}
/**
 * Options for `checkoutWithPatch`.
 */
export interface CheckoutWithPatchOptions extends CheckoutWith {
    /**
     * The name of the artifact the patch is stored as.
     * @default ".repo.patch"
     */
    readonly patchFile?: string;
}
/**
 * Options for `uploadGitPatch`.
 */
export interface UploadGitPatchOptions {
    /**
     * The step ID which produces the output which indicates if a patch was created.
     */
    readonly stepId: string;
    /**
     * The name of the step.
     * @default "Find mutations"
     */
    readonly stepName?: string;
    /**
     * The name of the artifact the patch is stored as.
     * @default ".repo.patch"
     */
    readonly patchFile?: string;
    /**
     * The name of the output to emit. It will be set to `true` if there was a diff.
     */
    readonly outputName: string;
    /**
     * Fail if a mutation was found and print this error message.
     * @default - do not fail upon mutation
     */
    readonly mutationError?: string;
}
export interface CreatePullRequestOptions {
    /**
     * The step ID which produces the output which indicates if a patch was created.
     * @default "create_pr"
     */
    readonly stepId?: string;
    /**
     * The name of the step displayed on GitHub.
     * @default "Create Pull Request"
     */
    readonly stepName?: string;
    /**
     * The job credentials used to create the pull request.
     *
     * Provided credentials must have permissions to create a pull request on the repository.
     */
    readonly credentials?: GithubCredentials;
    /**
     * The name of the workflow that will create the PR
     */
    readonly workflowName: string;
    /**
     * The full title used to create the pull request.
     *
     * If PR titles are validated in this repo, the title should comply with the respective rules.
     */
    readonly pullRequestTitle: string;
    /**
     * Description added to the pull request.
     *
     * Providence information are automatically added.
     */
    readonly pullRequestDescription: string;
    /**
     * Sets the pull request base branch.
     *
     * @default - The branch checked out in the workflow.
     */
    readonly baseBranch?: string;
    /**
     * The pull request branch name.
     *
     * @default `github-actions/${options.workflowName}`
     */
    readonly branchName?: string;
    /**
     * The git identity used to create the commit.
     * @default - the default github-actions user
     */
    readonly gitIdentity?: GitIdentity;
    /**
     * Add Signed-off-by line by the committer at the end of the commit log message.
     *
     * @default true
     */
    readonly signoff?: boolean;
    /**
     * Labels to apply on the PR.
     *
     * @default - no labels.
     */
    readonly labels?: string[];
    /**
     * Assignees to add on the PR.
     *
     * @default - no assignees
     */
    readonly assignees?: string[];
}
