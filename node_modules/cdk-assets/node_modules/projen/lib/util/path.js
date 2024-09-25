"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureRelativePathStartsWithDot = ensureRelativePathStartsWithDot;
/**
 * Helper function to format a path as dot notation regardless of how it
 * was handed in.
 *
 * @param path - can be formatted as "path", "./path" (but not "/path", as it is absolute)
 * @returns "./path"
 */
function ensureRelativePathStartsWithDot(path) {
    if (path.startsWith(".")) {
        return path;
    }
    if (path.startsWith("/")) {
        throw new Error(`Path ${path} must be relative`);
    }
    return `./${path}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL3BhdGgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFPQSwwRUFVQztBQWpCRDs7Ozs7O0dBTUc7QUFDSCxTQUFnQiwrQkFBK0IsQ0FBQyxJQUFZO0lBQzFELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3pCLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxJQUFJLG1CQUFtQixDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELE9BQU8sS0FBSyxJQUFJLEVBQUUsQ0FBQztBQUNyQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gZm9ybWF0IGEgcGF0aCBhcyBkb3Qgbm90YXRpb24gcmVnYXJkbGVzcyBvZiBob3cgaXRcbiAqIHdhcyBoYW5kZWQgaW4uXG4gKlxuICogQHBhcmFtIHBhdGggLSBjYW4gYmUgZm9ybWF0dGVkIGFzIFwicGF0aFwiLCBcIi4vcGF0aFwiIChidXQgbm90IFwiL3BhdGhcIiwgYXMgaXQgaXMgYWJzb2x1dGUpXG4gKiBAcmV0dXJucyBcIi4vcGF0aFwiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVSZWxhdGl2ZVBhdGhTdGFydHNXaXRoRG90KHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmIChwYXRoLnN0YXJ0c1dpdGgoXCIuXCIpKSB7XG4gICAgcmV0dXJuIHBhdGg7XG4gIH1cblxuICBpZiAocGF0aC5zdGFydHNXaXRoKFwiL1wiKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgUGF0aCAke3BhdGh9IG11c3QgYmUgcmVsYXRpdmVgKTtcbiAgfVxuXG4gIHJldHVybiBgLi8ke3BhdGh9YDtcbn1cbiJdfQ==