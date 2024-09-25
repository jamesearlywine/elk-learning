/**
 * @deprecated This class will be removed in upcoming releases. if you wish to
 * specify semver requirements in `deps`, `devDeps`, etc, specify them like so
 * `express@^2.1`.
 */
export declare class Semver {
    readonly spec: string;
    static of(spec: string): Semver;
    /**
     * Latest version.
     */
    static latest(): Semver;
    /**
     * Accept only an exact version
     */
    static pinned(version: string): Semver;
    /**
     * Accept any minor version.
     *
     * >= version
     * < next major version
     */
    static caret(version: string): Semver;
    /**
     * Accept patches.
     *
     * >= version
     * < next minor version
     */
    static tilde(version: string): Semver;
    readonly mode?: string;
    private constructor();
    get version(): string | undefined;
}
