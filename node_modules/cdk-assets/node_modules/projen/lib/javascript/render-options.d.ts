import * as inventory from "../inventory";
import { InitProjectOptionHints } from "../option-hints";
/**
 * Options for `renderProjectOptions`.
 */
export interface RenderProjectOptions {
    /**
     * The project type to render.
     */
    readonly type: inventory.ProjectType;
    /**
     * Project arguments as passed to `projen new`.
     */
    readonly args: Record<string, any>;
    /**
     * Include commented out options.
     * @default InitProjectOptionHints.FEATURED
     */
    readonly comments?: InitProjectOptionHints;
    /**
     * Inject a `__new__` attribute to the project constructor with a stringified
     * version of the project parameters and a `jsiiFqn` attribute that includes
     * the FQN of the project type. This is needed in order to generate initial
     * projenrc files.
     *
     * @default false
     */
    readonly bootstrap?: boolean;
    /**
     * A list of fields to omit from the initial projenrc file.
     * @default - none
     */
    readonly omitFromBootstrap?: string[];
    /**
     * Prefix all imports with this string and the full module name
     * This is required when executing options code in a vm
     *
     * @default - only use submodule as prefix
     */
    readonly prefixImports?: string;
}
/**
 * Renders options as if the project was created via `projen new` (embeds the __new__ field).
 */
export declare function renderProjenInitOptions(fqn: string, args: Record<string, any>, comments?: InitProjectOptionHints): any;
export declare function resolveInitProject(opts: any): {
    args: Record<string, any>;
    fqn: string;
    type: inventory.ProjectType;
    comments: InitProjectOptionHints;
} | undefined;
export declare class ModuleImports {
    private imports;
    /**
     * Add a named import from a module
     */
    add(moduleName: string, importName: string): void;
    /**
     * Get all named imports for a module
     */
    get(moduleName: string): string[];
    /**
     * Get a list of all used modules
     */
    get modules(): string[];
    /**
     * Return all imports as ESM import statements
     */
    asEsmImports(): string[];
    /**
     * Return all imports as CJS require statements
     */
    asCjsRequire(): string[];
    private all;
}
/**
 * Prints all parameters that can be used in a project type, alongside their descriptions.
 *
 * Parameters in `params` that aren't undefined are rendered as defaults,
 * while all other parameters are rendered as commented out.
 *
 * Returns the printed output and a set of required imports as an object
 * in the form { options, imports }.
 */
export declare function renderJavaScriptOptions(opts: RenderProjectOptions): {
    renderedOptions: string;
    imports: ModuleImports;
};
