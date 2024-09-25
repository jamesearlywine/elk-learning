export interface GroupRunnerOptions {
    readonly group: string;
    readonly labels?: string[];
}
export declare function filteredRunsOnOptions(runsOn?: string[], runsOnGroup?: GroupRunnerOptions): {
    runsOnGroup: GroupRunnerOptions;
} | {
    runsOn: string[];
};
export declare function filteredWorkflowRunsOnOptions(workflowRunsOn?: string[], workflowRunsOnGroup?: GroupRunnerOptions): {
    workflowRunsOnGroup: GroupRunnerOptions;
} | {
    workflowRunsOn: string[];
} | string[];
