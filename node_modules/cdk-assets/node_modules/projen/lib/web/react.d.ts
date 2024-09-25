import { Component } from "../component";
import { FileBase, FileBaseOptions, IResolver } from "../file";
import { NodeProject, NodeProjectOptions } from "../javascript";
import { TypeScriptAppProject, TypeScriptProjectOptions } from "../typescript";
export interface ReactRewireOptions {
    /**
     * Rewire webpack configuration.
     *
     * Use this property to override webpack configuration properties provided
     * by create-react-app, without needing to eject.
     *
     * This property will create a `config-overrides.js` file in your root directory,
     * which will contain the desired rewiring code.
     *
     * To **override** the configuration, you can provide simple key value pairs.
     * Keys take the form of js code directives that traverse to the desired property.
     * Values should be JSON serializable objects.
     *
     * For example, the following config:
     *
     * ```json
     * rewire: { "module.unknownContextCritical": false }
     * ```
     *
     * Will translate to the following `config-overrides.js` file:
     *
     * ```js
     * module.exports = function override(config, env) {
     *   config.module.unknownContextCritical = false;
     * }
     * ```
     *
     * @default - No rewired config.
     *
     * @see https://webpack.js.org/configuration/
     * @see https://github.com/timarney/react-app-rewired
     */
    readonly rewire?: {
        [key: string]: any;
    };
}
export interface ReactTypeScriptProjectOptions extends TypeScriptProjectOptions, ReactRewireOptions {
}
export interface ReactProjectOptions extends NodeProjectOptions, ReactRewireOptions {
    /**
     * Source directory.
     *
     * @default "src"
     */
    readonly srcdir?: string;
    /**
     * Generate one-time sample in `src/` and `public/` if there are no files there.
     * @default true
     */
    readonly sampleCode?: boolean;
}
/**
 * React project using JavaScript.
 *
 * @pjid react
 */
export declare class ReactProject extends NodeProject {
    /**
     * The directory in which source files reside.
     * @default "src"
     */
    readonly srcdir: string;
    constructor(options: ReactProjectOptions);
}
/**
 * React project using TypeScript.
 *
 * @pjid react-ts
 */
export declare class ReactTypeScriptProject extends TypeScriptAppProject {
    /**
     * The directory in which source files reside.
     */
    readonly srcdir: string;
    constructor(options: ReactTypeScriptProjectOptions);
}
export interface ReactComponentOptions extends ReactRewireOptions {
    /**
     * Whether to apply options specific for TypeScript React projects.
     *
     * @default false
     */
    readonly typescript?: boolean;
}
export declare class ReactComponent extends Component {
    private readonly typescript;
    constructor(project: NodeProject, options: ReactComponentOptions);
}
/**
 * @deprecated No longer used.
 */
export interface ReactTypeDefOptions extends FileBaseOptions {
}
/**
 * @deprecated No longer used.
 */
export declare class ReactTypeDef extends FileBase {
    constructor(project: ReactTypeScriptProject, filePath: string, options?: ReactTypeDefOptions);
    protected synthesizeContent(_: IResolver): string | undefined;
}
