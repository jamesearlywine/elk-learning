import { Construct } from "constructs";
import { Component } from "../component";
import { Task } from "../task";
/**
 * Options to configure the license checker
 */
export interface LicenseCheckerOptions {
    /**
     * Check production dependencies.
     * @default true
     */
    readonly production?: boolean;
    /**
     * Check development dependencies.
     * @default false
     */
    readonly development?: boolean;
    /**
     * List of SPDX license identifiers that are allowed to be used.
     *
     * For the license check to pass, all detected licenses MUST be in this list.
     * Only one of `allowedLicenses` and `prohibitedLicenses` can be provided and must not be empty.
     * @default - no licenses are allowed
     */
    readonly allow?: string[];
    /**
     * List of SPDX license identifiers that are prohibited to be used.
     *
     * For the license check to pass, no detected licenses can be in this list.
     * Only one of `allowedLicenses` and `prohibitedLicenses` can be provided and must not be empty.
     * @default - no licenses are prohibited
     */
    readonly deny?: string[];
    /**
     * The name of the task that is added to check licenses
     *
     * @default "check-licenses"
     */
    readonly taskName?: string;
}
/**
 * Enforces allowed licenses used by dependencies.
 */
export declare class LicenseChecker extends Component {
    readonly task: Task;
    constructor(scope: Construct, options: LicenseCheckerOptions);
}
