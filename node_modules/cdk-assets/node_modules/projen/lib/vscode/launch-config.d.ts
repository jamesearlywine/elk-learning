import { VsCode } from "./vscode";
import { Component } from "../component";
import { JsonFile } from "../json";
/**
 * Controls where to launch the debug target
 * Source: https://code.visualstudio.com/docs/editor/debugging#_launchjson-attributes
 */
export declare enum Console {
    INTERNAL_CONSOLE = "internalConsole",
    INTEGRATED_TERMINAL = "integratedTerminal",
    EXTERNAL_TERMINAL = "externalTerminal"
}
/**
 * Controls the visibility of the VSCode Debug Console panel during a debugging session
 * Source: https://code.visualstudio.com/docs/editor/debugging#_launchjson-attributes
 */
export declare enum InternalConsoleOptions {
    NEVER_OPEN = "neverOpen",
    OPEN_ON_FIRST_SESSION_START = "openOnFirstSessionStart",
    OPEN_ON_SESSION_START = "openOnSessionStart"
}
/**
 * VSCode launch configuration Presentation interface
 * "using the order, group, and hidden attributes in the presentation object you can sort,
 * group, and hide configurations and compounds in the Debug configuration dropdown
 * and in the Debug quick pick."
 * Source: https://code.visualstudio.com/docs/editor/debugging#_launchjson-attributes
 */
export interface Presentation {
    readonly hidden: boolean;
    readonly group: string;
    readonly order: number;
}
/**
 * VSCode launch configuration ServerReadyAction interface
 * "if you want to open a URL in a web browser whenever the program under debugging
 * outputs a specific message to the debug console or integrated terminal."
 * Source: https://code.visualstudio.com/docs/editor/debugging#_launchjson-attributes
 */
export interface ServerReadyAction {
    readonly action: string;
    readonly pattern?: string;
    readonly uriFormat?: string;
}
/**
 * Options for a 'VsCodeLaunchConfigurationEntry'
 * Source: https://code.visualstudio.com/docs/editor/debugging#_launchjson-attributes
 */
export interface VsCodeLaunchConfigurationEntry {
    readonly type: string;
    readonly request: string;
    readonly name: string;
    readonly args?: string[];
    readonly debugServer?: number;
    readonly internalConsoleOptions?: InternalConsoleOptions;
    readonly runtimeArgs?: string[];
    readonly postDebugTask?: string;
    readonly preLaunchTask?: string;
    readonly presentation?: Presentation;
    readonly program?: string;
    readonly serverReadyAction?: ServerReadyAction;
    readonly skipFiles?: string[];
    readonly outFiles?: string[];
    readonly url?: string;
    readonly webRoot?: string;
    /**
     * Set value to `false` to unset an existing environment variable
     */
    readonly env?: Record<string, string | false>;
    readonly envFile?: string;
    readonly cwd?: string;
    readonly port?: number;
    readonly stopOnEntry?: boolean;
    readonly console?: Console;
    readonly disableOptimisticBPs?: boolean;
}
/**
 * Base options for a 'VsCodeLaunchInputEntry'
 * Source: https://code.visualstudio.com/docs/editor/variables-reference#_input-variables
 */
export interface VsCodeLaunchInputEntry {
    readonly id: string;
}
/**
 * Options for a 'VsCodeLaunchPromptStringInputEntry'
 * Source: https://code.visualstudio.com/docs/editor/variables-reference#_input-variables
 */
export interface VsCodeLaunchPromptStringInputEntry extends VsCodeLaunchInputEntry {
    readonly description: string;
    readonly default?: string;
    readonly password?: boolean;
}
/**
 * Options for a 'VsCodeLaunchPickStringInputEntry'
 * Source: https://code.visualstudio.com/docs/editor/variables-reference#_input-variables
 */
export interface VsCodeLaunchPickStringInputEntry extends VsCodeLaunchInputEntry {
    readonly description: string;
    readonly default?: string;
    readonly options: string[];
}
/**
 * Options for a 'VsCodeLaunchCommandInputEntry'
 * Source: https://code.visualstudio.com/docs/editor/variables-reference#_input-variables
 */
export interface VsCodeLaunchCommandInputEntry extends VsCodeLaunchInputEntry {
    readonly command: string;
    readonly args?: unknown;
}
/**
 * VSCode launch configuration file (launch.json), useful for enabling in-editor debugger
 */
export declare class VsCodeLaunchConfig extends Component {
    private static renderLaunchConfig;
    private readonly content;
    readonly file: JsonFile;
    constructor(vscode: VsCode);
    /**
     * Adds a VsCodeLaunchConfigurationEntry (e.g. a node.js debugger) to `.vscode/launch.json.
     * Each configuration entry has following mandatory fields: type, request and name.
     * See https://code.visualstudio.com/docs/editor/debugging#_launchjson-attributes for details.
     * @param cfg VsCodeLaunchConfigurationEntry
     */
    addConfiguration(cfg: VsCodeLaunchConfigurationEntry): void;
    /**
     * Adds an input variable with type `promptString` to `.vscode/launch.json`.
     *
     * See https://code.visualstudio.com/docs/editor/variables-reference#_input-variables for details.
     * @param cfg VsCodeLaunchPromptStringInputEntry
     */
    addPromptStringInput(cfg: VsCodeLaunchPromptStringInputEntry): void;
    /**
     * Adds an input variable with type `pickString` to `.vscode/launch.json`.
     *
     * See https://code.visualstudio.com/docs/editor/variables-reference#_input-variables for details.
     * @param cfg VsCodeLaunchPickStringInputEntry
     */
    addPickStringInput(cfg: VsCodeLaunchPickStringInputEntry): void;
    /**
     * Adds an input variable with type `command` to `.vscode/launch.json`.
     *
     * See https://code.visualstudio.com/docs/editor/variables-reference#_input-variables for details.
     * @param cfg VsCodeLaunchCommandInputEntry
     */
    addCommandInput(cfg: VsCodeLaunchCommandInputEntry): void;
    private addInput;
}
