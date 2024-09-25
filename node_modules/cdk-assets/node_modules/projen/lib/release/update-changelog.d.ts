export interface UpdateChangelogOptions {
    /**
     * Path to input changelog entry file.
     *
     * Relative to cwd.
     *
     * @example dist/changelog.md
     */
    inputChangelog: string;
    /**
     * Path to project-level changelog.
     *
     * The contents of inputChangelog will be prepended onto
     * this changelog.
     *
     * Relative to cwd
     *
     * @example changelog.md
     */
    outputChangelog: string;
    /**
     * Release version.
     */
    versionFile: string;
}
/**
 * Prepends input changelog entry onto project-level changelog.
 *
 * Currently assumes a headerless changelog formatted according to
 * [conventional-changelog](https://github.com/conventional-changelog/conventional-changelog)
 * rules.
 *
 * @param cwd working directory (git repository)
 * @param options options
 */
export declare function updateChangelog(cwd: string, options: UpdateChangelogOptions): Promise<void>;
