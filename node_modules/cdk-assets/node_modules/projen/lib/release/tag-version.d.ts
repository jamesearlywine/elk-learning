export interface TagOptions {
    /**
     * Path to release tag file housing the release version.
     *
     * Relative to cwd.
     *
     * @example `dist/releaseTag.txt`
     */
    readonly releaseTagFile: string;
    /**
     * Path to release-specific changelog file.
     *
     * Relative to cwd.
     *
     * @example `dist/changelog.md`
     */
    readonly changelog: string;
}
/**
 * Generate an annotated release tag using version and changelog files.
 *
 * The tag will be normalized to the format "v<version>" where version comes
 * from the provided version file.
 *
 * The tag annotation message will be set to the content of the provided release
 * changelog file.
 *
 * @param cwd working directory (git repository)
 * @param options options
 */
export declare function tag(cwd: string, options: TagOptions): Promise<void>;
