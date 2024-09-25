import { TasksManifest, TaskSpec } from "./task-model";
/**
 * The runtime component of the tasks engine.
 */
export declare class TaskRuntime {
    /**
     * The project-relative path of the tasks manifest file.
     */
    static readonly MANIFEST_FILE: string;
    /**
     * The contents of tasks.json
     */
    readonly manifest: TasksManifest;
    /**
     * The root directory of the project and the cwd for executing tasks.
     */
    readonly workdir: string;
    constructor(workdir: string);
    /**
     * The tasks in this project.
     */
    get tasks(): TaskSpec[];
    /**
     * Find a task by name, or `undefined` if not found.
     */
    tryFindTask(name: string): TaskSpec | undefined;
    /**
     * Runs the task.
     * @param name The task name.
     */
    runTask(name: string, parents?: string[], args?: Array<string | number>, env?: {
        [name: string]: string;
    }): void;
}
