import { IConstruct } from "constructs";
import { Component } from "./component";
/**
 * Options for logging utilities.
 */
export interface LoggerOptions {
    /**
     * The logging verbosity. The levels available (in increasing verbosity) are
     * OFF, ERROR, WARN, INFO, DEBUG, and VERBOSE.
     *
     * @default LogLevel.INFO
     */
    readonly level?: LogLevel;
    /**
     * Include a prefix for all logging messages with the project name.
     *
     * @default false
     */
    readonly usePrefix?: boolean;
}
/**
 * Project-level logging utilities.
 */
export declare class Logger extends Component {
    private readonly level;
    private readonly usePrefix;
    constructor(scope: IConstruct, options?: LoggerOptions);
    /**
     * Log a message to stderr with a given logging level. The message will be
     * printed as long as `logger.level` is set to the message's severity or higher.
     *
     * @param level Logging verbosity
     * @param text strings or objects to print
     */
    log(level: LogLevel, ...text: any[]): void;
    /**
     * Log a message to stderr with VERBOSE severity
     * @param text strings or objects to print
     */
    verbose(...text: any[]): void;
    /**
     * Log a message to stderr with DEBUG severity
     * @param text strings or objects to print
     */
    debug(...text: any[]): void;
    /**
     * Log a message to stderr with INFO severity
     * @param text strings or objects to print
     */
    info(...text: any[]): void;
    /**
     * Log a message to stderr with WARN severity
     * @param text strings or objects to print
     */
    warn(...text: any[]): void;
    /**
     * Log a message to stderr with ERROR severity
     * @param text strings or objects to print
     */
    error(...text: any[]): void;
    private colorForLogLevel;
}
/**
 * Logging verbosity.
 */
export declare enum LogLevel {
    OFF = "00.off",
    ERROR = "10.error",
    WARN = "20.warn",
    INFO = "30.info",
    DEBUG = "40.debug",
    VERBOSE = "50.verbose"
}
