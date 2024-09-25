import { VsCode } from "./vscode";
import { Component } from "../component";
import { JsonFile } from "../json";
/**
 * VS Code Workspace settings
 * Source: https://code.visualstudio.com/docs/getstarted/settings#_workspace-settings
 */
export declare class VsCodeSettings extends Component {
    private readonly content;
    readonly file: JsonFile;
    constructor(vscode: VsCode);
    /**
     * Adds a workspace setting
     *
     * @param setting The setting ID
     * @param value The value of the setting
     * @param language Scope the setting to a specific language
     */
    addSetting(setting: string, value: unknown, language?: string): void;
    /**
     * Adds a workspace setting
     *
     * @param settings Array structure: [setting: string, value: any, languages?: string[]]
     */
    addSettings(settings: Record<string, unknown>, languages?: string | string[]): void;
}
