"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CliError = void 0;
exports.installPackage = installPackage;
exports.renderInstallCommand = renderInstallCommand;
exports.findJsiiFilePath = findJsiiFilePath;
const fs = require("fs");
const path = require("path");
const logging = require("../logging");
const util_1 = require("../util");
/**
 * Installs the npm module (through `npm install`) to node_modules under `projectDir`.
 * @param spec The npm package spec (e.g. `foo@^1.2` or `foo@/var/folders/8k/qcw0ls5pv_ph0000gn/T/projen-RYurCw/pkg.tgz`)
 * @returns The installed package name (e.g. `@foo/bar`)
 */
function installPackage(baseDir, spec, isProjen = false) {
    const packageJsonPath = path.join(baseDir, "package.json");
    const packageJsonExisted = fs.existsSync(packageJsonPath);
    if (!packageJsonExisted) {
        // Make sure we have a package.json to read from later
        (0, util_1.exec)("npm init --yes", { cwd: baseDir });
    }
    logging.info(`installing module ${spec}...`);
    (0, util_1.exec)(renderInstallCommand(baseDir, spec), { cwd: baseDir });
    // Get the true installed package name
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const packageName = Object.keys(packageJson.devDependencies).find((name) => isProjen ? name === "projen" : name !== "projen");
    if (!packageName) {
        throw new Error(`Unable to resolve package name from spec ${spec}`);
    }
    // if package.json did not exist before calling `npm install`, we should remove it
    // so we can start off clean.
    if (!packageJsonExisted) {
        fs.rmSync(packageJsonPath, { force: true, recursive: true });
    }
    return packageName;
}
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
function renderInstallCommand(dir, module) {
    return `npm install --save --save-dev -f --no-package-lock --prefix="${dir}" ${module}`;
}
function findJsiiFilePath(baseDir, moduleName) {
    try {
        return path.dirname(require.resolve(`${moduleName}/.jsii`, {
            paths: [baseDir],
        }));
    }
    catch (error) {
        if (error instanceof Error &&
            "code" in error &&
            error.code === "MODULE_NOT_FOUND") {
            // the provided module is not a jsii module
            return undefined;
        }
        else {
            // unexpected error, throw it
            throw error;
        }
    }
}
class CliError extends Error {
    constructor(...lines) {
        super(lines.join("\n"));
        this.name = "CliError";
    }
}
exports.CliError = CliError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFVQSx3Q0FpQ0M7QUFjRCxvREFFQztBQUVELDRDQXVCQztBQXBGRCx5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLHNDQUFzQztBQUN0QyxrQ0FBK0I7QUFFL0I7Ozs7R0FJRztBQUNILFNBQWdCLGNBQWMsQ0FDNUIsT0FBZSxFQUNmLElBQVksRUFDWixRQUFRLEdBQUcsS0FBSztJQUVoQixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztJQUMzRCxNQUFNLGtCQUFrQixHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7SUFFMUQsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDeEIsc0RBQXNEO1FBQ3RELElBQUEsV0FBSSxFQUFDLGdCQUFnQixFQUFFLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLElBQUksS0FBSyxDQUFDLENBQUM7SUFDN0MsSUFBQSxXQUFJLEVBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFFNUQsc0NBQXNDO0lBQ3RDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUMxRSxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUN6RSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxRQUFRLENBQ2pELENBQUM7SUFFRixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDakIsTUFBTSxJQUFJLEtBQUssQ0FBQyw0Q0FBNEMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRUQsa0ZBQWtGO0lBQ2xGLDZCQUE2QjtJQUM3QixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUN4QixFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7R0FXRztBQUNILFNBQWdCLG9CQUFvQixDQUFDLEdBQVcsRUFBRSxNQUFjO0lBQzlELE9BQU8sZ0VBQWdFLEdBQUcsS0FBSyxNQUFNLEVBQUUsQ0FBQztBQUMxRixDQUFDO0FBRUQsU0FBZ0IsZ0JBQWdCLENBQzlCLE9BQWUsRUFDZixVQUFrQjtJQUVsQixJQUFJLENBQUM7UUFDSCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQ2pCLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxVQUFVLFFBQVEsRUFBRTtZQUNyQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUM7U0FDakIsQ0FBQyxDQUNILENBQUM7SUFDSixDQUFDO0lBQUMsT0FBTyxLQUFjLEVBQUUsQ0FBQztRQUN4QixJQUNFLEtBQUssWUFBWSxLQUFLO1lBQ3RCLE1BQU0sSUFBSSxLQUFLO1lBQ2YsS0FBSyxDQUFDLElBQUksS0FBSyxrQkFBa0IsRUFDakMsQ0FBQztZQUNELDJDQUEyQztZQUMzQyxPQUFPLFNBQVMsQ0FBQztRQUNuQixDQUFDO2FBQU0sQ0FBQztZQUNOLDZCQUE2QjtZQUM3QixNQUFNLEtBQUssQ0FBQztRQUNkLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQUVELE1BQWEsUUFBUyxTQUFRLEtBQUs7SUFDakMsWUFBWSxHQUFHLEtBQWU7UUFDNUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQztJQUN6QixDQUFDO0NBQ0Y7QUFMRCw0QkFLQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgbG9nZ2luZyBmcm9tIFwiLi4vbG9nZ2luZ1wiO1xuaW1wb3J0IHsgZXhlYyB9IGZyb20gXCIuLi91dGlsXCI7XG5cbi8qKlxuICogSW5zdGFsbHMgdGhlIG5wbSBtb2R1bGUgKHRocm91Z2ggYG5wbSBpbnN0YWxsYCkgdG8gbm9kZV9tb2R1bGVzIHVuZGVyIGBwcm9qZWN0RGlyYC5cbiAqIEBwYXJhbSBzcGVjIFRoZSBucG0gcGFja2FnZSBzcGVjIChlLmcuIGBmb29AXjEuMmAgb3IgYGZvb0AvdmFyL2ZvbGRlcnMvOGsvcWN3MGxzNXB2X3BoMDAwMGduL1QvcHJvamVuLVJZdXJDdy9wa2cudGd6YClcbiAqIEByZXR1cm5zIFRoZSBpbnN0YWxsZWQgcGFja2FnZSBuYW1lIChlLmcuIGBAZm9vL2JhcmApXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnN0YWxsUGFja2FnZShcbiAgYmFzZURpcjogc3RyaW5nLFxuICBzcGVjOiBzdHJpbmcsXG4gIGlzUHJvamVuID0gZmFsc2Vcbik6IHN0cmluZyB7XG4gIGNvbnN0IHBhY2thZ2VKc29uUGF0aCA9IHBhdGguam9pbihiYXNlRGlyLCBcInBhY2thZ2UuanNvblwiKTtcbiAgY29uc3QgcGFja2FnZUpzb25FeGlzdGVkID0gZnMuZXhpc3RzU3luYyhwYWNrYWdlSnNvblBhdGgpO1xuXG4gIGlmICghcGFja2FnZUpzb25FeGlzdGVkKSB7XG4gICAgLy8gTWFrZSBzdXJlIHdlIGhhdmUgYSBwYWNrYWdlLmpzb24gdG8gcmVhZCBmcm9tIGxhdGVyXG4gICAgZXhlYyhcIm5wbSBpbml0IC0teWVzXCIsIHsgY3dkOiBiYXNlRGlyIH0pO1xuICB9XG5cbiAgbG9nZ2luZy5pbmZvKGBpbnN0YWxsaW5nIG1vZHVsZSAke3NwZWN9Li4uYCk7XG4gIGV4ZWMocmVuZGVySW5zdGFsbENvbW1hbmQoYmFzZURpciwgc3BlYyksIHsgY3dkOiBiYXNlRGlyIH0pO1xuXG4gIC8vIEdldCB0aGUgdHJ1ZSBpbnN0YWxsZWQgcGFja2FnZSBuYW1lXG4gIGNvbnN0IHBhY2thZ2VKc29uID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGFja2FnZUpzb25QYXRoLCBcInV0Zi04XCIpKTtcbiAgY29uc3QgcGFja2FnZU5hbWUgPSBPYmplY3Qua2V5cyhwYWNrYWdlSnNvbi5kZXZEZXBlbmRlbmNpZXMpLmZpbmQoKG5hbWUpID0+XG4gICAgaXNQcm9qZW4gPyBuYW1lID09PSBcInByb2plblwiIDogbmFtZSAhPT0gXCJwcm9qZW5cIlxuICApO1xuXG4gIGlmICghcGFja2FnZU5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byByZXNvbHZlIHBhY2thZ2UgbmFtZSBmcm9tIHNwZWMgJHtzcGVjfWApO1xuICB9XG5cbiAgLy8gaWYgcGFja2FnZS5qc29uIGRpZCBub3QgZXhpc3QgYmVmb3JlIGNhbGxpbmcgYG5wbSBpbnN0YWxsYCwgd2Ugc2hvdWxkIHJlbW92ZSBpdFxuICAvLyBzbyB3ZSBjYW4gc3RhcnQgb2ZmIGNsZWFuLlxuICBpZiAoIXBhY2thZ2VKc29uRXhpc3RlZCkge1xuICAgIGZzLnJtU3luYyhwYWNrYWdlSnNvblBhdGgsIHsgZm9yY2U6IHRydWUsIHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgfVxuXG4gIHJldHVybiBwYWNrYWdlTmFtZTtcbn1cblxuLyoqXG4gKiBSZW5kZXIgYSBjb21tYW5kIHRvIGluc3RhbGwgYW4gbnBtIHBhY2thZ2UuXG4gKlxuICogRW5naW5lIGNoZWNrcyBhcmUgaWdub3JlZCBhdCB0aGlzIHBvaW50IHNvIHRoYXQgdGhlIG1vZHVsZSBjYW4gYmUgaW5zdGFsbGVkXG4gKiByZWdhcmRsZXNzIG9mIHRoZSBlbnZpcm9ubWVudC4gVGhpcyB3YXMgbmVlZGVkIHRvIHVuYmxvY2sgdGhlIHVwZ3JhZGUgb2YgdGhlXG4gKiBtaW5pbXVtIG5vZGUgdmVyc2lvbiBvZiBwcm9qZW4sIGJ1dCBhbHNvIG9rYXkgZ2VuZXJhbGx5IGJlY2F1c2UgZW5naW5lIGNoZWNrc1xuICogd2lsbCBiZSBwZXJmb3JtZWQgbGF0ZXIgYW5kIGZvciBhbGwgZXRlcm5pdHkuXG4gKlxuICogQHBhcmFtIGRpciBCYXNlIGRpcmVjdG9yeVxuICogQHBhcmFtIG1vZHVsZSBUaGUgbW9kdWxlIHRvIGluc3RhbGwgKGUuZy4gZm9vQF4xLjIpXG4gKiBAcmV0dXJucyBUaGUgc3RyaW5nIHRoYXQgaW5jbHVkZXMgdGhlIGluc3RhbGwgY29tbWFuZCAoXCJucG0gaW5zdGFsbCAuLi5cIilcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckluc3RhbGxDb21tYW5kKGRpcjogc3RyaW5nLCBtb2R1bGU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBgbnBtIGluc3RhbGwgLS1zYXZlIC0tc2F2ZS1kZXYgLWYgLS1uby1wYWNrYWdlLWxvY2sgLS1wcmVmaXg9XCIke2Rpcn1cIiAke21vZHVsZX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZEpzaWlGaWxlUGF0aChcbiAgYmFzZURpcjogc3RyaW5nLFxuICBtb2R1bGVOYW1lOiBzdHJpbmdcbik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHBhdGguZGlybmFtZShcbiAgICAgIHJlcXVpcmUucmVzb2x2ZShgJHttb2R1bGVOYW1lfS8uanNpaWAsIHtcbiAgICAgICAgcGF0aHM6IFtiYXNlRGlyXSxcbiAgICAgIH0pXG4gICAgKTtcbiAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICBpZiAoXG4gICAgICBlcnJvciBpbnN0YW5jZW9mIEVycm9yICYmXG4gICAgICBcImNvZGVcIiBpbiBlcnJvciAmJlxuICAgICAgZXJyb3IuY29kZSA9PT0gXCJNT0RVTEVfTk9UX0ZPVU5EXCJcbiAgICApIHtcbiAgICAgIC8vIHRoZSBwcm92aWRlZCBtb2R1bGUgaXMgbm90IGEganNpaSBtb2R1bGVcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHVuZXhwZWN0ZWQgZXJyb3IsIHRocm93IGl0XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENsaUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvciguLi5saW5lczogc3RyaW5nW10pIHtcbiAgICBzdXBlcihsaW5lcy5qb2luKFwiXFxuXCIpKTtcbiAgICB0aGlzLm5hbWUgPSBcIkNsaUVycm9yXCI7XG4gIH1cbn1cbiJdfQ==