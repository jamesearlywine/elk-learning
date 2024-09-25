import { Workflow, Job } from "./model";
import { Component } from "../component";
import { Project } from "../project";
import { YamlFile } from "../yaml";
/**
 * Options for class {@link Circleci}
 *
 * @see https://circleci.com/docs/2.0/configuration-reference/
 */
export interface CircleCiProps {
    /**
     * Contains a map of CirclCi Orbs
     * ```json
     * orbs: {
     *  node: "circleci/node@5.0.1"
     *  slack: "circleci/slack@4.8.3"
     * }
     * ```
     */
    readonly orbs?: Record<string, string>;
    /**
     * pipeline version
     *
     * @default 2.1
     * @see https://circleci.com/docs/2.0/configuration-reference/#version
     */
    readonly version?: number;
    /**
     * List of Workflows of pipeline, e.g.
     * ```json
     * workflows: {
     *   {
     *     identifier: "build",
     *       jobs: [{
     *          identifier: "node/install",
     *          context: ["npm"],
     *       }]
     *   }
     * }
     * ```
     *
     * @see https://circleci.com/docs/2.0/configuration-reference/#workflows
     */
    readonly workflows?: Workflow[];
    /**
     * List of Jobs to create unique steps per pipeline, e.g.
     * ```json
     * jobs: [{
     *  identifier: "compile",
     *  docker: { image: "golang:alpine" }
     *  steps: ["checkout", run: {command: "go build ."}]
     * }]
     * ```
     *
     * @see https://circleci.com/docs/2.0/configuration-reference/#jobs
     */
    readonly jobs?: Job[];
    /**
     * The setup field enables you to conditionally trigger configurations from outside
     * the primary .circleci parent directory, update pipeline parameters, or generate customized configurations.
     *
     * @see https://circleci.com/docs/2.0/configuration-reference/#setup
     */
    readonly setup?: boolean;
}
/**
 * Circleci Class to manage `.circleci/config.yml`.
 * Check projen's docs for more information.
 *
 * @see https://circleci.com/docs/2.0/configuration-reference/
 */
export declare class Circleci extends Component {
    /**
     * The yaml file for the Circleci pipeline
     * */
    readonly file: YamlFile;
    /**
     * internal copy of options to share options between functions
     * @private
     */
    private options;
    /**
     * internal map of orbs
     * @private
     */
    private readonly orbs;
    /**
     * internal list of workflows
     * @private
     */
    private workflows;
    /**
     * internal list of jobs
     * @private
     */
    private readonly jobs;
    constructor(project: Project, options?: CircleCiProps);
    /**
     * function to prepare the rendering of the yaml file.
     * Objects with dynamic keys like workflows and jobs required the field `identifier` to be set.
     * Those object will be reduced by `identifier` field before rendering
     * @private
     */
    private renderCircleCi;
    /**
     * add new workflow to existing pipeline
     * @param workflow
     */
    addWorkflow(workflow: Workflow): void;
    /**
     * reduce objects with `identifier` field for WorkflowJobs.
     * A workflow job can contain `orbParameter` which are passed to orbs.
     * This map is directly added as `Record<string,any>` to job.
     * So we gonna add those after the default field of WorkflowJob.
     * @see https://circleci.com/developer/orbs/orb/circleci/node#usage-install_nodejs
     * @param jobs
     */
    private renderJobs;
    /**
     * Add a Circleci Orb to pipeline. Will throw error if the orb already exists
     * @param name
     * @param orb
     */
    addOrb(name: string, orb: string): void;
    /**
     * Snake case for listed keys. There are too many exceptions needed to do it recursive without a whitelist.
     * This list needs to be updated once we add field with snake case like `aws_auth`.
     * @param input
     */
    private snakeCase;
}
export declare const isObjectContainingFieldExactly: (obj: any, field: string) => boolean;
