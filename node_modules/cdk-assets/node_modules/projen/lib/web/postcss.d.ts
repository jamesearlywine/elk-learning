import { TailwindConfig, TailwindConfigOptions } from "./tailwind";
import { NodeProject } from "../javascript";
import { JsonFile } from "../json";
export interface PostCssOptions {
    /**
     * @default "postcss.config.json"
     */
    readonly fileName?: string;
    /**
     * Install Tailwind CSS as a PostCSS plugin.
     *
     * @default true
     */
    readonly tailwind?: boolean;
    /**
     * Tailwind CSS options.
     */
    readonly tailwindOptions?: TailwindConfigOptions;
}
/**
 * Declares a PostCSS dependency with a default config file.
 */
export declare class PostCss {
    readonly fileName: string;
    readonly file: JsonFile;
    readonly tailwind?: TailwindConfig;
    constructor(project: NodeProject, options?: PostCssOptions);
}
