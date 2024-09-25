import { Component } from "../component";
import { Project } from "../project";
import { Task } from "../task";
/**
 * Options for IntegrationTest
 */
export interface IntegrationTestBaseOptions {
    /**
     * Name of the integration test
     * @default - Derived from the entrypoint filename.
     */
    readonly name?: string;
    /**
     * A path from the project root directory to a TypeScript file which contains
     * the integration test app.
     *
     * This is relative to the root directory of the project.
     *
     * @example "test/subdir/foo.integ.ts"
     */
    readonly entrypoint: string;
    /**
     * The path of the tsconfig.json file to use when running integration test cdk apps.
     */
    readonly tsconfigPath: string;
}
export declare abstract class IntegrationTestBase extends Component {
    /**
     * Deploy the integration test and update the snapshot upon success.
     */
    readonly deployTask: Task;
    /**
     * Synthesizes the integration test and compares against a local copy (runs during build).
     */
    readonly assertTask: Task;
    /**
     * Just update snapshot (without deployment).
     */
    readonly snapshotTask: Task;
    /**
     * Temporary directory for each integration test.
     */
    protected readonly tmpDir: string;
    /**
     * Snapshot output directory.
     */
    protected readonly snapshotDir: string;
    /**
     * Integration test name.
     */
    protected readonly name: string;
    constructor(project: Project, options: IntegrationTestBaseOptions);
}
