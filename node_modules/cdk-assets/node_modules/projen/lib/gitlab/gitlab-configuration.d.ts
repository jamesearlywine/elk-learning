import { CiConfigurationOptions } from ".";
import { CiConfiguration } from "./configuration";
import { NestedConfiguration } from "./nested-configuration";
import { Project } from "../project";
/**
 * A GitLab CI for the main `.gitlab-ci.yml` file.
 */
export declare class GitlabConfiguration extends CiConfiguration {
    readonly nestedTemplates: Record<string, NestedConfiguration>;
    constructor(project: Project, options?: CiConfigurationOptions);
    /**
     * Creates and adds nested templates to the includes of the main CI.
     * Additionally adds their stages to the main CI if they are not already present.
     * You can futher customize nested templates through the `nestedTemplates` property.
     * E.g. gitlabConfig.nestedTemplates['templateName']?.addStages('stageName')
     * @param config a record the names and configuraitons of the templates.
     */
    createNestedTemplates(config: Record<string, CiConfigurationOptions>): void;
}
