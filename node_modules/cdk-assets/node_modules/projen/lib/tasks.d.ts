import { Component } from "./component";
import { Project } from "./project";
import { Task, TaskOptions } from "./task";
/**
 * Defines project tasks.
 *
 * Tasks extend the projen CLI by adding subcommands to it. Task definitions are
 * synthesized into `.projen/tasks.json`.
 */
export declare class Tasks extends Component {
    private readonly _tasks;
    private readonly _env;
    constructor(project: Project);
    /**
     * All tasks.
     */
    get all(): Task[];
    /**
     * Adds a task to a project.
     * @param name The name of the task
     * @param options Task options.
     */
    addTask(name: string, options?: TaskOptions): Task;
    /**
     * Removes a task from a project.
     *
     * @param name The name of the task to remove.
     *
     * @returns The `Task` that was removed, otherwise `undefined`.
     */
    removeTask(name: string): undefined | Task;
    /**
     * Adds global environment.
     * @param name Environment variable name
     * @param value Value
     */
    addEnvironment(name: string, value: string): void;
    /**
     * Returns a copy of the currently global environment for this project.
     */
    get env(): {
        [key: string]: string;
    };
    /**
     * Finds a task by name. Returns `undefined` if the task cannot be found.
     * @param name The name of the task
     */
    tryFind(name: string): undefined | Task;
    synthesize(): void;
    private renderTasks;
    private renderEnv;
    /**
     * Ensure that environment variables are persisted as strings
     * to prevent type errors when parsing from tasks.json in future
     */
    private getEnvString;
}
