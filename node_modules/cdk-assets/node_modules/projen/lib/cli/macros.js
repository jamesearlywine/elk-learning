"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryProcessMacro = tryProcessMacro;
const path = require("path");
const util_1 = require("../util");
function tryProcessMacro(cwd, macro) {
    if (!macro.startsWith("$")) {
        return undefined;
    }
    const basedir = path.basename(cwd);
    switch (macro) {
        case "$BASEDIR":
            return basedir;
        case "$GIT_REMOTE":
            const origin = (0, util_1.execOrUndefined)("git remote get-url origin", { cwd });
            if (origin) {
                return origin;
            }
            const slug = getFromGitConfig(cwd, "github.user") ?? resolveEmail(cwd).split("@")[0];
            return `https://github.com/${slug}/${basedir}.git`;
        case "$GIT_USER_NAME":
            return getFromGitConfig(cwd, "user.name") ?? "user";
        case "$GIT_USER_EMAIL":
            return resolveEmail(cwd);
        case "$PYTHON_MODULE_NAME":
            return (0, util_1.formatAsPythonModule)(basedir);
    }
    return undefined;
}
/**
 * Returns a value from git config. Searches local and then global git config.
 * @param key the config key
 */
function getFromGitConfig(cwd, key) {
    return ((0, util_1.execOrUndefined)(`git config --get --includes ${key}`, { cwd }) ??
        (0, util_1.execOrUndefined)(`git config --get --global --includes ${key}`, { cwd }));
}
function resolveEmail(cwd) {
    return getFromGitConfig(cwd, "user.email") ?? "user@domain.com";
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFjcm9zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NsaS9tYWNyb3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSwwQ0E0QkM7QUEvQkQsNkJBQTZCO0FBQzdCLGtDQUFnRTtBQUVoRSxTQUFnQixlQUFlLENBQUMsR0FBVyxFQUFFLEtBQWE7SUFDeEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUMzQixPQUFPLFNBQVMsQ0FBQztJQUNuQixDQUFDO0lBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVuQyxRQUFRLEtBQUssRUFBRSxDQUFDO1FBQ2QsS0FBSyxVQUFVO1lBQ2IsT0FBTyxPQUFPLENBQUM7UUFDakIsS0FBSyxhQUFhO1lBQ2hCLE1BQU0sTUFBTSxHQUFHLElBQUEsc0JBQWUsRUFBQywyQkFBMkIsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDckUsSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFDWCxPQUFPLE1BQU0sQ0FBQztZQUNoQixDQUFDO1lBQ0QsTUFBTSxJQUFJLEdBQ1IsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxJQUFJLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUUsT0FBTyxzQkFBc0IsSUFBSSxJQUFJLE9BQU8sTUFBTSxDQUFDO1FBRXJELEtBQUssZ0JBQWdCO1lBQ25CLE9BQU8sZ0JBQWdCLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxJQUFJLE1BQU0sQ0FBQztRQUN0RCxLQUFLLGlCQUFpQjtZQUNwQixPQUFPLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzQixLQUFLLHFCQUFxQjtZQUN4QixPQUFPLElBQUEsMkJBQW9CLEVBQUMsT0FBTyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVELE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLGdCQUFnQixDQUFDLEdBQVcsRUFBRSxHQUFXO0lBQ2hELE9BQU8sQ0FDTCxJQUFBLHNCQUFlLEVBQUMsK0JBQStCLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDOUQsSUFBQSxzQkFBZSxFQUFDLHdDQUF3QyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQ3hFLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsR0FBVztJQUMvQixPQUFPLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxZQUFZLENBQUMsSUFBSSxpQkFBaUIsQ0FBQztBQUNsRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgZXhlY09yVW5kZWZpbmVkLCBmb3JtYXRBc1B5dGhvbk1vZHVsZSB9IGZyb20gXCIuLi91dGlsXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiB0cnlQcm9jZXNzTWFjcm8oY3dkOiBzdHJpbmcsIG1hY3JvOiBzdHJpbmcpIHtcbiAgaWYgKCFtYWNyby5zdGFydHNXaXRoKFwiJFwiKSkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBjb25zdCBiYXNlZGlyID0gcGF0aC5iYXNlbmFtZShjd2QpO1xuXG4gIHN3aXRjaCAobWFjcm8pIHtcbiAgICBjYXNlIFwiJEJBU0VESVJcIjpcbiAgICAgIHJldHVybiBiYXNlZGlyO1xuICAgIGNhc2UgXCIkR0lUX1JFTU9URVwiOlxuICAgICAgY29uc3Qgb3JpZ2luID0gZXhlY09yVW5kZWZpbmVkKFwiZ2l0IHJlbW90ZSBnZXQtdXJsIG9yaWdpblwiLCB7IGN3ZCB9KTtcbiAgICAgIGlmIChvcmlnaW4pIHtcbiAgICAgICAgcmV0dXJuIG9yaWdpbjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNsdWcgPVxuICAgICAgICBnZXRGcm9tR2l0Q29uZmlnKGN3ZCwgXCJnaXRodWIudXNlclwiKSA/PyByZXNvbHZlRW1haWwoY3dkKS5zcGxpdChcIkBcIilbMF07XG4gICAgICByZXR1cm4gYGh0dHBzOi8vZ2l0aHViLmNvbS8ke3NsdWd9LyR7YmFzZWRpcn0uZ2l0YDtcblxuICAgIGNhc2UgXCIkR0lUX1VTRVJfTkFNRVwiOlxuICAgICAgcmV0dXJuIGdldEZyb21HaXRDb25maWcoY3dkLCBcInVzZXIubmFtZVwiKSA/PyBcInVzZXJcIjtcbiAgICBjYXNlIFwiJEdJVF9VU0VSX0VNQUlMXCI6XG4gICAgICByZXR1cm4gcmVzb2x2ZUVtYWlsKGN3ZCk7XG4gICAgY2FzZSBcIiRQWVRIT05fTU9EVUxFX05BTUVcIjpcbiAgICAgIHJldHVybiBmb3JtYXRBc1B5dGhvbk1vZHVsZShiYXNlZGlyKTtcbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHZhbHVlIGZyb20gZ2l0IGNvbmZpZy4gU2VhcmNoZXMgbG9jYWwgYW5kIHRoZW4gZ2xvYmFsIGdpdCBjb25maWcuXG4gKiBAcGFyYW0ga2V5IHRoZSBjb25maWcga2V5XG4gKi9cbmZ1bmN0aW9uIGdldEZyb21HaXRDb25maWcoY3dkOiBzdHJpbmcsIGtleTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIChcbiAgICBleGVjT3JVbmRlZmluZWQoYGdpdCBjb25maWcgLS1nZXQgLS1pbmNsdWRlcyAke2tleX1gLCB7IGN3ZCB9KSA/P1xuICAgIGV4ZWNPclVuZGVmaW5lZChgZ2l0IGNvbmZpZyAtLWdldCAtLWdsb2JhbCAtLWluY2x1ZGVzICR7a2V5fWAsIHsgY3dkIH0pXG4gICk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVFbWFpbChjd2Q6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBnZXRGcm9tR2l0Q29uZmlnKGN3ZCwgXCJ1c2VyLmVtYWlsXCIpID8/IFwidXNlckBkb21haW4uY29tXCI7XG59XG4iXX0=