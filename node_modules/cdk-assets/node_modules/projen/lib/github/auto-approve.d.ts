import { GitHub } from "./github";
import { Component } from "../component";
import { GroupRunnerOptions } from "../runner-options";
/**
 * Options for 'AutoApprove'
 */
export interface AutoApproveOptions {
    /**
     * Only pull requests authored by these Github usernames will be auto-approved.
     * @default ['github-bot']
     */
    readonly allowedUsernames?: string[];
    /**
     * Only pull requests with this label will be auto-approved.
     * @default 'auto-approve'
     */
    readonly label?: string;
    /**
     * A GitHub secret name which contains a GitHub Access Token
     * with write permissions for the `pull_request` scope.
     *
     * This token is used to approve pull requests.
     *
     * Github forbids an identity to approve its own pull request.
     * If your project produces automated pull requests using the Github default token -
     * {@link https://docs.github.com/en/actions/reference/authentication-in-a-workflow `GITHUB_TOKEN` }
     * - that you would like auto approved, such as when using the `depsUpgrade` property in
     * `NodeProjectOptions`, then you must use a different token here.
     *
     * @default "GITHUB_TOKEN"
     */
    readonly secret?: string;
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
/**
 * Auto approve pull requests that meet a criteria
 */
export declare class AutoApprove extends Component {
    readonly label: string;
    constructor(github: GitHub, options?: AutoApproveOptions);
}
