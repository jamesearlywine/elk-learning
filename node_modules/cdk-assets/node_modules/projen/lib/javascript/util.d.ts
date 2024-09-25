import { Project } from "../project";
/**
 * Basic interface for `package.json`.
 */
interface PackageManifest {
    [key: string]: any;
    /**
     * Package name.
     */
    name: string;
    /**
     * Package version.
     */
    version: string;
}
export declare function renderBundleName(entrypoint: string): string;
/**
 * Regex for AWS CodeArtifact registry
 */
export declare const codeArtifactRegex: RegExp;
/**
 * gets AWS details from the Code Artifact registry URL
 * throws exception if not matching expected pattern
 * @param registryUrl Code Artifact registry URL
 * @returns object containing the (domain, accountId, region, repository)
 */
export declare function extractCodeArtifactDetails(registryUrl: string): {
    domain: string;
    accountId: string;
    region: string;
    repository: string;
    registry: string;
};
export declare function minVersion(version: string): string | undefined;
/**
 * Attempt to resolve location of the given `moduleId`.
 * @param moduleId Module ID to lookup.
 * @param options Passed through to `require.resolve`.
 */
export declare function tryResolveModule(moduleId: string, options?: {
    paths: string[];
}): string | undefined;
/**
 * Attempt to resolve a module's manifest (package.json) path via `require.resolve` lookup.
 *
 * @remarks
 * If the target package has `exports` that differ from the default
 * (i.e, it defines the `exports` field in its manifest) and does not
 * explicitly include an entry for `package.json`, this strategy will fail.
 * See {@link tryResolveManifestPathFromDefaultExport} as an alternative.
 *
 * @param moduleId Module ID to lookup.
 * @param options Passed through to `require.resolve`.
 */
export declare function tryResolveModuleManifestPath(moduleId: string, options?: {
    paths: string[];
}): string | undefined;
/**
 * Attempt to resolve a module's manifest (package.json) path by looking for the nearest
 * `package.json` file that is an ancestor to the module's default export location.
 *
 * @param moduleId Module ID to lookup.
 * @param options Passed through to `require.resolve`.
 */
export declare function tryResolveManifestPathFromDefaultExport(moduleId: string, options?: {
    paths: string[];
}): string | undefined;
/**
 * Attempt to resolve a module's manifest (package.json) path by checking for its existence under `node_modules` relative to `basePath`.
 *
 * @remarks
 * This strategy can be helpful in the scenario that a module defines
 * custom exports without `package.json` and no default export (i.e, some type definition packages).
 *
 * @param moduleId Module ID to lookup.
 * @param basePath Root path to search from.
 */
export declare function tryResolveManifestPathFromPath(moduleId: string, basePath: string): string | undefined;
/**
 * Attempt to resolve a module's manifest (package.json) path by searching for it in the optionally provided paths array
 * as well as the current node processes' default resolution paths.
 * @param moduleId Module ID to search for.
 * @param options Search options.
 */
export declare function tryResolveManifestPathFromSearch(moduleId: string, options?: {
    paths: string[];
}): string | undefined;
/**
 * Attempt to resolve a module's manifest (package.json) using multiple strategies.
 * @param moduleId Module to resolve manifest path for.
 * @param options Resolution options.
 */
export declare function tryResolveModuleManifest(moduleId: string, options?: {
    paths: string[];
}): PackageManifest | undefined;
/**
 * Attempt to resolve the installed version of a given dependency.
 * @param dependencyName Name of dependency.
 * @param options Optional options passed through to `require.resolve`.
 */
export declare function tryResolveDependencyVersion(dependencyName: string, options?: {
    paths: string[];
}): string | undefined;
/**
 * Whether the given dependency version is installed
 *
 * This can be used to test for the presence of certain versions of devDependencies,
 * and do something dependency-specific in certain Components. For example, test for
 * a version of Jest and generate different configs based on the Jest version.
 *
 * NOTE: The implementation of this function currently is currently
 * approximate: to do it correctly, we would need a separate implementation
 * for every package manager, to query its installed version (either that, or we
 * would code to query `package-lock.json`, `yarn.lock`, etc...).
 *
 * Instead, we will look at `package.json`, and assume that the versions
 * picked by the package manager match ~that. This will work well enough for
 * major version checks, but may fail for point versions.
 *
 * What we SHOULD do is: `actualVersion ∈ checkRange`.
 *
 * What we do instead is a slightly more sophisticated version of
 * `requestedRange ∩ checkRange != ∅`. This will always give a correct result if
 * `requestedRange ⊆ checkRange`, but may give false positives when `checkRange
 * ⊆ requestedRange`.
 *
 * May return `undefined` if the question cannot be answered. These include the
 * following cases:
 *
 *   - The dependency is requested via local file dependencies (`file://...`)
 *   - The dependency uses an other type of URL, such as a GitHub URL
 *   - The dependency is not found in the `package.json`, such as when
 *     bootstrapping from an external projen package, and the `package.json`
 *     file only has that one external package as a dependency
 *
 * Otherwise it will return `true` if the installed version is probably in the
 * requested range, and `false` if it is probably not.
 *
 * This API may eventually be added to the public projen API, but only after
 * we implement exact version checking.
 *
 * @param dependencyName The name of the dependency
 * @param checkRange A particular version, or range of versions.
 */
export declare function hasDependencyVersion(project: Project, dependencyName: string, checkRange: string): boolean | undefined;
/**
 * Whether the given requestedRange *probably* leads to the installation of a version that matches checkRange
 *
 * We assume that NPM always installs the most recent version of a package that
 * is allowed by the requestedRange.
 */
export declare function installedVersionProbablyMatches(requestedRange: string, checkRange: string): boolean;
export {};
