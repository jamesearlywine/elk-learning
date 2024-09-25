import { Component } from "./component";
import { JsonFile } from "./json";
import { Project } from "./project";
/**
 * Options for Renovatebot
 */
export interface RenovatebotOptions {
    /**
     * How often to check for new versions and raise pull requests.
     *
     * Can be given in CRON or LATER format, and use multiple schedules
     * (e.g. different for weekdays and weekends). Multiple rules are
     * handles as OR.
     *
     * Some normal scheduling values defined in enum `RenovatebotScheduleInterval`.
     *
     * @see https://docs.renovatebot.com/configuration-options/#schedule
     * @default ["at any time"]
     */
    readonly scheduleInterval?: string[];
    /**
     * You can use the `ignore` option to customize which dependencies are updated.
     * The ignore option supports just package name.
     * @default []
     */
    readonly ignore?: string[];
    /**
     * Ignores updates to `projen`.
     *
     * This is required since projen updates may cause changes in committed files
     * and anti-tamper checks will fail.
     *
     * Projen upgrades are covered through the `ProjenUpgrade` class.
     *
     * @default true
     */
    readonly ignoreProjen?: boolean;
    /**
     * List of labels to apply to the created PR's.
     */
    readonly labels?: string[];
    readonly overrideConfig?: any;
    readonly marker?: boolean;
}
/**
 * How often to check for new versions and raise pull requests for version
 * updates.
 *
 * @see https://docs.renovatebot.com/presets-schedule/
 */
export declare enum RenovatebotScheduleInterval {
    /**
     * Run at any time
     */
    ANY_TIME = "at any time",
    /**
     * Weekly schedule on early monday mornings
     */
    EARLY_MONDAYS = "before 3am on Monday",
    /**
     * Schedule daily
     */
    DAILY = "before 2am",
    /**
     * Schedule weekly
     */
    WEEKLY = "before 3am on Monday",
    /**
     * Schedule monthly
     */
    MONTHLY = "before 3am on the first day of the month",
    /**
     * Schedule quarterly
     */
    QUARTERLY = "every 3 months on the first day of the month",
    /**
     * Schedule for weekends
     */
    WEEKENDS = "every weekend",
    /**
     * Schedule for weekdays
     */
    WEEKDAYS = "every weekday"
}
/**
 * Defines renovatebot configuration for projen project.
 *
 * Ignores the versions controlled by Projen.
 */
export declare class Renovatebot extends Component {
    /**
     * The file holding the renovatebot configuration
     */
    readonly file: JsonFile;
    private readonly _project;
    private readonly explicitIgnores;
    private readonly scheduleInterval;
    private readonly labels?;
    private readonly marker?;
    private readonly overrideConfig?;
    constructor(project: Project, options?: RenovatebotOptions);
    private createRenovateConfiguration;
}
