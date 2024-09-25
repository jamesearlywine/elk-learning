import { IConstruct } from "constructs";
import { Component } from "../component";
/**
 * Options for `JsiiDocgen`
 */
export interface JsiiDocgenOptions {
    /**
     * File path for generated docs.
     * @default "API.md"
     */
    readonly filePath?: string;
    /**
     * A semver version string to install a specific version of jsii-docgen.
     *
     * @default '*'
     */
    readonly version?: string;
}
/**
 * Creates a markdown file based on the jsii manifest:
 * - Adds a `docgen` script to package.json
 * - Runs `jsii-docgen` after compilation
 * - Enforces that markdown file is checked in
 */
export declare class JsiiDocgen extends Component {
    constructor(scope: IConstruct, options?: JsiiDocgenOptions);
}
