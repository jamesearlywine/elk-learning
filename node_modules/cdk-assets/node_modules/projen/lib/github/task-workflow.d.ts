import { GitHub } from "./github";
import { TaskWorkflowJobOptions } from "./task-workflow-job";
import { GithubWorkflow } from "./workflows";
import { Triggers } from "./workflows-model";
import { Task } from "../task";
/**
 * Options to create a TaskWorkflow.
 */
export interface TaskWorkflowOptions extends TaskWorkflowJobOptions {
    /**
     * The workflow name.
     */
    readonly name: string;
    /**
     * The primary job id.
     * @default "build"
     */
    readonly jobId?: string;
    /**
     * The triggers for the workflow.
     *
     * @default - by default workflows can only be triggered by manually.
     */
    readonly triggers?: Triggers;
    /**
     * The main task to be executed.
     */
    readonly task: Task;
}
/**
 * A GitHub workflow for common build tasks within a project.
 */
export declare class TaskWorkflow extends GithubWorkflow {
    readonly jobId: string;
    readonly artifactsDirectory?: string;
    constructor(github: GitHub, options: TaskWorkflowOptions);
}
/**
 * Represents the git identity.
 */
export interface GitIdentity {
    /**
     * The name of the user.
     */
    readonly name: string;
    /**
     * The email address of the git user.
     */
    readonly email: string;
}
