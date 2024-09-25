/**
 * Installs the npm module (through `npm install`) to node_modules under `projectDir`.
 * @param spec The npm package spec (e.g. `foo@^1.2` or `foo@/var/folders/8k/qcw0ls5pv_ph0000gn/T/projen-RYurCw/pkg.tgz`)
 * @returns The installed package name (e.g. `@foo/bar`)
 */
export declare function installPackage(baseDir: string, spec: string, isProjen?: boolean): string;
/**
 * Render a command to install an npm package.
 *
 * Engine checks are ignored at this point so that the module can be installed
 * regardless of the environment. This was needed to unblock the upgrade of the
 * minimum node version of projen, but also okay generally because engine checks
 * will be performed later and for all eternity.
 *
 * @param dir Base directory
 * @param module The module to install (e.g. foo@^1.2)
 * @returns The string that includes the install command ("npm install ...")
 */
export declare function renderInstallCommand(dir: string, module: string): string;
export declare function findJsiiFilePath(baseDir: string, moduleName: string): string | undefined;
export declare class CliError extends Error {
    constructor(...lines: string[]);
}
