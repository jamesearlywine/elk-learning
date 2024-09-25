import { VsCodeRecommendedExtensions } from "./extensions";
import { VsCodeLaunchConfig } from "./launch-config";
import { VsCodeSettings } from "./settings";
import { Component } from "../component";
import { Project } from "../project";
export declare class VsCode extends Component {
    private _launchConfig?;
    private _settings?;
    private _extensions?;
    constructor(project: Project);
    get launchConfiguration(): VsCodeLaunchConfig;
    get settings(): VsCodeSettings;
    get extensions(): VsCodeRecommendedExtensions;
}
