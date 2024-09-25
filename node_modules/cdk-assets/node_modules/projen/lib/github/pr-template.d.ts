import { GitHub } from "./github";
import { Project } from "../project";
import { TextFile } from "../textfile";
/**
 * Options for `PullRequestTemplate`.
 */
export interface PullRequestTemplateOptions {
    /**
     * The contents of the template. You can use `addLine()` to add additional lines.
     *
     * @default - a standard default template will be created.
     */
    readonly lines?: string[];
}
/**
 * Template for GitHub pull requests.
 */
export declare class PullRequestTemplate extends TextFile {
    /**
     * Returns the `PullRequestTemplate` instance associated with a project or `undefined` if
     * there is no PullRequestTemplate.
     * @param project The project
     * @returns A PullRequestTemplate
     */
    static of(project: Project): PullRequestTemplate | undefined;
    constructor(github: GitHub, options?: PullRequestTemplateOptions);
}
