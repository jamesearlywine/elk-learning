import { TaskRuntime } from "../task-runtime";
export interface SynthOptions {
    /**
     * Execute post synthesis commands.
     * @default true
     */
    readonly post?: boolean;
    /**
     * Start watching .projenrc.js and re-synth when changed.
     * @default false
     */
    readonly watch?: boolean;
    /**
     * The name of the .projenrc.js file  to use instead of the default.
     * @default ".projenrc.js"
     */
    readonly rcfile?: string;
}
export declare function synth(runtime: TaskRuntime, options: SynthOptions): Promise<void>;
