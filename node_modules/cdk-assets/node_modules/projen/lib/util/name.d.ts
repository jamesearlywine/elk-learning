import { Project } from "../project";
/**
 * Generate workflow name with suffix based on if project is subproject or not
 * @param base name prefix
 * @param project to which the workflow belongs
 */
export declare function workflowNameForProject(base: string, project: Project): string;
