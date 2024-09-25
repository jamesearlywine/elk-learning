import { Component } from "./component";
import { Project } from "./project";
import { Task } from "./task";
/**
 * Manages a standard build process for all projects.
 *
 * Build spawns these tasks in order:
 * 1. default
 * 2. pre-compile
 * 3. compile
 * 4. post-compile
 * 5. test
 * 6. package
 */
export declare class ProjectBuild extends Component {
    /**
     * The task responsible for a full release build.
     */
    readonly buildTask: Task;
    /**
     * Pre-compile task.
     */
    readonly preCompileTask: Task;
    /**
     * Compiles the code. By default for node.js projects this task is empty.
     */
    readonly compileTask: Task;
    /**
     * Post-compile task.
     */
    readonly postCompileTask: Task;
    /**
     * Tests the code.
     */
    readonly testTask: Task;
    /**
     * The "package" task.
     */
    readonly packageTask: Task;
    constructor(project: Project);
}
