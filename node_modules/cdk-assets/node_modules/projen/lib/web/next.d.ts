import { Component } from "../component";
import { NodeProject, NodeProjectOptions } from "../javascript";
import { TypeScriptAppProject, TypeScriptProjectOptions } from "../typescript";
export interface NextJsCommonProjectOptions {
    /**
     * Assets directory
     *
     * @default "public"
     */
    readonly assetsdir?: string;
    /**
     * Setup Tailwind CSS as a PostCSS plugin.
     *
     * @see https://tailwindcss.com/docs/installation
     *
     * @default true
     * @featured
     */
    readonly tailwind?: boolean;
}
export interface NextJsTypeScriptProjectOptions extends NextJsCommonProjectOptions, TypeScriptProjectOptions {
}
export interface NextJsProjectOptions extends NextJsCommonProjectOptions, NodeProjectOptions {
    /**
     * Typescript sources directory.
     *
     * @default "src"
     */
    readonly srcdir?: string;
    /**
     * Generate one-time sample in `pages/` and `public/` if there are no files there.
     * @default true
     */
    readonly sampleCode?: boolean;
}
/**
 * Next.js project using JavaScript.
 *
 * @pjid nextjs
 */
export declare class NextJsProject extends NodeProject {
    /**
     * The directory in which source files reside.
     */
    readonly srcdir: string;
    /**
     * The directory in which app assets reside.
     */
    readonly assetsdir: string;
    /**
     * Setup Tailwind as a PostCSS plugin.
     *
     * @see https://tailwindcss.com/docs/installation
     */
    readonly tailwind: boolean;
    constructor(options: NextJsProjectOptions);
}
/**
 * Next.js project using TypeScript.
 *
 * @pjid nextjs-ts
 */
export declare class NextJsTypeScriptProject extends TypeScriptAppProject {
    /**
     * The directory in which source files reside.
     */
    readonly srcdir: string;
    /**
     * The directory in which app assets reside.
     */
    readonly assetsdir: string;
    /**
     * Setup Tailwind as a PostCSS plugin.
     *
     * @see https://tailwindcss.com/docs/installation
     */
    readonly tailwind: boolean;
    constructor(options: NextJsTypeScriptProjectOptions);
}
export interface NextComponentOptions {
    /**
     * Whether to apply options specific for TypeScript Next.js projects.
     *
     * @default false
     */
    readonly typescript?: boolean;
    /**
     * Setup Tailwind as a PostCSS plugin.
     *
     * @see https://tailwindcss.com/docs/installation
     *
     * @default true
     */
    readonly tailwind?: boolean;
}
export declare class NextComponent extends Component {
    private readonly typescript;
    private readonly tailwind;
    constructor(project: NodeProject, options: NextComponentOptions);
}
