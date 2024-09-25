import { NodeProject } from "../javascript";
import { JsonFile } from "../json";
export interface TailwindConfigOptions {
    /**
     * @default "tailwind.config.json"
     */
    readonly fileName?: string;
}
/**
 * Declares a Tailwind CSS configuration file.
 *
 * There are multiple ways to add Tailwind CSS in your node project - see:
 * https://tailwindcss.com/docs/installation
 *
 * @see PostCss
 */
export declare class TailwindConfig {
    readonly fileName: string;
    readonly file: JsonFile;
    constructor(project: NodeProject, options?: TailwindConfigOptions);
}
