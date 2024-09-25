/**
 * Manage the versions used for GitHub Actions used in steps
 */
export declare class GitHubActionsProvider {
    private actions;
    /**
     * Define an override for a given action.
     *
     * Specify the action name without a version to override all usages of the action.
     * You can also override a specific action version, by providing the version string.
     * Specific overrides take precedence over overrides without a version.
     *
     * If an override for the same action name is set multiple times, the last override is used.
     *
     * @example
     * // Force any use of `actions/checkout` to use a pin a specific commit
     * project.github.actions.set("actions/checkout", "actions/checkout@aaaaaa");
     *
     * // But pin usage of `v4` to a different commit
     * project.github.actions.set("actions/checkout@v4", "actions/checkout@ffffff");
     */
    set(action: string, override: string): void;
    /**
     * Resolve an action name to the version that should be used,
     * taking into account any overrides.
     */
    get(action: string): string;
}
