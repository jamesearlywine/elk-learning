import { Component } from "../component";
import { Project } from "../project";
import { Task } from "../task";
/**
 * Adds standard AWS CDK tasks to your project.
 */
export declare class CdkTasks extends Component {
    /**
     * Synthesizes your app.
     */
    readonly synth: Task;
    /**
     * Synthesizes your app and suppresses stdout.
     */
    readonly synthSilent: Task;
    /**
     * Deploys your app.
     */
    readonly deploy: Task;
    /**
     * Destroys all the stacks.
     */
    readonly destroy: Task;
    /**
     * Diff against production.
     */
    readonly diff: Task;
    /**
     * Watch task.
     */
    readonly watch: Task;
    constructor(project: Project);
}
