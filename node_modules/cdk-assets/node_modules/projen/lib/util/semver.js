"use strict";
// stolen from: https://github.com/aws/jsii/blob/main/packages/jsii-pacmak/lib/targets/version-utils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetName = void 0;
exports.toMavenVersionRange = toMavenVersionRange;
exports.toNuGetVersionRange = toNuGetVersionRange;
exports.toPythonVersionRange = toPythonVersionRange;
exports.toReleaseVersion = toReleaseVersion;
const util_1 = require("util");
const semver_1 = require("semver");
var TargetName;
(function (TargetName) {
    TargetName[TargetName["JAVA"] = 0] = "JAVA";
    TargetName[TargetName["DOTNET"] = 1] = "DOTNET";
    TargetName[TargetName["PYTHON"] = 2] = "PYTHON";
    TargetName[TargetName["GO"] = 3] = "GO";
    TargetName[TargetName["JAVASCRIPT"] = 4] = "JAVASCRIPT";
})(TargetName || (exports.TargetName = TargetName = {}));
/**
 * Converts a SemVer range expression to a Maven version range expression.
 *
 * @param semverRange the SemVer range expression to convert.
 * @param suffix      the suffix to add to versions in the range.
 *
 * @see https://cwiki.apache.org/confluence/display/MAVENOLD/Dependency+Mediation+and+Conflict+Resolution
 */
function toMavenVersionRange(semverRange, suffix) {
    return toBracketNotation(semverRange, suffix, {
        semver: false,
        target: TargetName.JAVA,
    });
}
/**
 * Converts a SemVer range expression to a NuGet version range expression.
 *
 * @param semverRange the SemVer range expression to convert.
 *
 * @see https://docs.microsoft.com/en-us/nuget/concepts/package-versioning#version-ranges-and-wildcards
 */
function toNuGetVersionRange(semverRange) {
    return toBracketNotation(semverRange, undefined, {
        semver: false,
        target: TargetName.DOTNET,
    });
}
/**
 * Converts a SemVer range expression to a Python setuptools compatible version
 * constraint expression.
 *
 * @param semverRange the SemVer range expression to convert.
 */
function toPythonVersionRange(semverRange) {
    const range = new semver_1.Range(semverRange);
    return range.set
        .map((set) => set
        .map((comp) => {
        const versionId = toReleaseVersion(comp.semver.raw?.replace(/-0$/, "") ?? "0.0.0", TargetName.PYTHON);
        switch (comp.operator) {
            case "":
                // With ^0.0.0, somehow we get a left entry with an empty operator and value, we'll fix this up
                return comp.value === "" ? ">=0.0.0" : `==${versionId}`;
            case "=":
                return `==${versionId}`;
            default:
                // >, >=, <, <= are all valid expressions
                return `${comp.operator}${versionId}`;
        }
    })
        .join(", "))
        .join(", ");
}
/**
 * Converts an original version number from the NPM convention to the target
 * language's convention for expressing the same. For versions that do not
 * include a prerelease identifier, this always returns the assembly version
 * unmodified.
 *
 * @param assemblyVersion the assembly version being released
 * @param target          the target language for which the version is destined
 *
 * @returns the version that should be serialized
 */
function toReleaseVersion(assemblyVersion, target) {
    const version = (0, semver_1.parse)(assemblyVersion);
    if (version == null) {
        throw new Error(`Unable to parse the provided assembly version: "${assemblyVersion}"`);
    }
    if (version.prerelease.length === 0) {
        return assemblyVersion;
    }
    switch (target) {
        case TargetName.PYTHON:
            const baseVersion = `${version.major}.${version.minor}.${version.patch}`;
            // Python supports a limited set of identifiers... And we have a mapping table...
            // https://packaging.python.org/guides/distributing-packages-using-setuptools/#pre-release-versioning
            const releaseLabels = {
                alpha: "a",
                beta: "b",
                rc: "rc",
                post: "post",
                dev: "dev",
                pre: "pre",
            };
            const validationErrors = [];
            // Ensure that prerelease composed entirely of [label, sequence] pairs
            version.prerelease.forEach((elem, idx, arr) => {
                const next = arr[idx + 1];
                if (typeof elem === "string") {
                    if (!Object.keys(releaseLabels).includes(elem)) {
                        validationErrors.push(`Label ${elem} is not one of ${Object.keys(releaseLabels).join(",")}`);
                    }
                    if (next === undefined || !Number.isInteger(next)) {
                        validationErrors.push(`Label ${elem} must be followed by a positive integer`);
                    }
                }
            });
            if (validationErrors.length > 0) {
                throw new Error(`Unable to map prerelease identifier (in: ${assemblyVersion}) components to python: ${(0, util_1.inspect)(version.prerelease)}. The format should be 'X.Y.Z-[label.sequence][.post.sequence][.(dev|pre).sequence]', where sequence is a positive integer and label is one of ${(0, util_1.inspect)(Object.keys(releaseLabels))}. Validation errors encountered: ${validationErrors.join(", ")}`);
            }
            // PEP440 supports multiple labels in a given version, so
            // we should attempt to identify and map as many labels as
            // possible from the given prerelease input
            // e.g. 1.2.3-rc.123.dev.456.post.789 => 1.2.3.rc123.dev456.post789
            const postIdx = version.prerelease.findIndex((v) => v.toString() === "post");
            const devIdx = version.prerelease.findIndex((v) => ["dev", "pre"].includes(v.toString()));
            const preReleaseIdx = version.prerelease.findIndex((v) => ["alpha", "beta", "rc"].includes(v.toString()));
            const prereleaseVersion = [
                preReleaseIdx > -1
                    ? `${releaseLabels[version.prerelease[preReleaseIdx]]}${version.prerelease[preReleaseIdx + 1] ?? 0}`
                    : undefined,
                postIdx > -1
                    ? `post${version.prerelease[postIdx + 1] ?? 0}`
                    : undefined,
                devIdx > -1 ? `dev${version.prerelease[devIdx + 1] ?? 0}` : undefined,
            ]
                .filter((v) => v)
                .join(".");
            return version.build.length > 0
                ? `${baseVersion}.${prereleaseVersion}+${version.build.join(".")}`
                : `${baseVersion}.${prereleaseVersion}`;
        case TargetName.DOTNET:
        case TargetName.GO:
        case TargetName.JAVA:
        case TargetName.JAVASCRIPT:
            // Not touching - the NPM version number should be usable as-is
            break;
    }
    return assemblyVersion;
}
/**
 * Converts a semantic version range to the kind of bracket notation used by
 * Maven and NuGet. For example, this turns `^1.2.3` into `[1.2.3,2.0.0)`.
 *
 * @param semverRange The semantic version range to be converted.
 * @param suffix A version suffix to apply to versions in the resulting expression.
 * @param semver Whether the target supports full semantic versioning (including
 *               `-0` as the lowest possible prerelease identifier)
 *
 * @returns a bracket-notation version range.
 */
function toBracketNotation(semverRange, suffix, { semver = true, target = TargetName.JAVASCRIPT, } = {}) {
    if (semverRange === "*") {
        semverRange = ">=0.0.0";
    }
    const range = new semver_1.Range(semverRange);
    if (semverRange === range.range) {
        return semverRange;
    }
    return range.set
        .map((set) => {
        if (set.length === 1) {
            const version = set[0].semver.raw;
            if (!version && range.raw === ">=0.0.0") {
                // Case where version is '*'
                return "[0.0.0,)";
            }
            switch (set[0].operator || "=") {
                // "[version]" => means exactly version
                case "=":
                    return `[${addSuffix(version)}]`;
                // "(version,]" => means greater than version
                case ">":
                    return `(${addSuffix(version)},)`;
                // "[version,]" => means greater than or equal to that version
                case ">=":
                    return `[${addSuffix(version)},)`;
                // "[,version)" => means less than version
                case "<":
                    return `(,${addSuffix(version, !semver)})`;
                // "[,version]" => means less than or equal to version
                case "<=":
                    return `(,${addSuffix(version)}]`;
            }
        }
        else if (set.length === 2) {
            const nugetRange = toBracketRange(set[0], set[1]);
            if (nugetRange) {
                return nugetRange;
            }
        }
        throw new Error(`Unsupported SemVer range set in ${semverRange}: ${set
            .map((comp) => comp.value)
            .join(", ")}`);
    })
        .join(", ");
    function toBracketRange(left, right) {
        if (left.operator.startsWith("<") && right.operator.startsWith(">")) {
            // Order isn't ideal, swap around..
            [left, right] = [right, left];
        }
        // With ^0.0.0, somehow we get a left entry with an empty operator and value, we'll fix this up
        if (left.operator === "" && left.value === "") {
            left = new semver_1.Comparator(">=0.0.0", left.options);
        }
        if (!left.operator.startsWith(">") || !right.operator.startsWith("<")) {
            // We only support ranges defined like "> (or >=) left, < (or <=) right"
            return undefined;
        }
        const leftBrace = left.operator.endsWith("=") ? "[" : "(";
        const rightBrace = right.operator.endsWith("=") ? "]" : ")";
        return `${leftBrace}${addSuffix(left.semver.raw)},${addSuffix(right.semver.raw, right.operator === "<" && !semver)}${rightBrace}`;
    }
    function addSuffix(str, trimDashZero = false) {
        if (!str) {
            return "";
        }
        if (trimDashZero) {
            str = str.replace(/-0$/, "");
        }
        return suffix ? `${str}${suffix}` : toReleaseVersion(str, target);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VtdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWwvc2VtdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx1R0FBdUc7OztBQXFCdkcsa0RBUUM7QUFTRCxrREFLQztBQVFELG9EQXdCQztBQWFELDRDQWlHQztBQXZMRCwrQkFBK0I7QUFDL0IsbUNBQWtEO0FBRWxELElBQVksVUFNWDtBQU5ELFdBQVksVUFBVTtJQUNwQiwyQ0FBSSxDQUFBO0lBQ0osK0NBQU0sQ0FBQTtJQUNOLCtDQUFNLENBQUE7SUFDTix1Q0FBRSxDQUFBO0lBQ0YsdURBQVUsQ0FBQTtBQUNaLENBQUMsRUFOVyxVQUFVLDBCQUFWLFVBQVUsUUFNckI7QUFFRDs7Ozs7OztHQU9HO0FBQ0gsU0FBZ0IsbUJBQW1CLENBQ2pDLFdBQW1CLEVBQ25CLE1BQWU7SUFFZixPQUFPLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUU7UUFDNUMsTUFBTSxFQUFFLEtBQUs7UUFDYixNQUFNLEVBQUUsVUFBVSxDQUFDLElBQUk7S0FDeEIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVEOzs7Ozs7R0FNRztBQUNILFNBQWdCLG1CQUFtQixDQUFDLFdBQW1CO0lBQ3JELE9BQU8saUJBQWlCLENBQUMsV0FBVyxFQUFFLFNBQVMsRUFBRTtRQUMvQyxNQUFNLEVBQUUsS0FBSztRQUNiLE1BQU0sRUFBRSxVQUFVLENBQUMsTUFBTTtLQUMxQixDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFnQixvQkFBb0IsQ0FBQyxXQUFtQjtJQUN0RCxNQUFNLEtBQUssR0FBRyxJQUFJLGNBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNyQyxPQUFPLEtBQUssQ0FBQyxHQUFHO1NBQ2IsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FDWCxHQUFHO1NBQ0EsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7UUFDWixNQUFNLFNB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QUFDO1FBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzFELE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUM1RCxPQUFPLEdBQUcsU0FBUyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FDM0QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQ2hCLEtBQUssQ0FBQyxRQUFRLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUNsQyxHQUFHLFVBQVUsRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFRCxTQUFTLFNBQVMsQ0FBQyxHQUF1QixFQUFFLFlBQVksR0FBRyxLQUFLO1FBQzlELElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNULE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQztRQUNELElBQUksWUFBWSxFQUFFLENBQUM7WUFDakIsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFDRCxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNwRSxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIHN0b2xlbiBmcm9tOiBodHRwczovL2dpdGh1Yi5jb20vYXdzL2pzaWkvYmxvYi9tYWluL3BhY2thZ2VzL2pzaWktcGFjbWFrL2xpYi90YXJnZXRzL3ZlcnNpb24tdXRpbHMudHNcblxuaW1wb3J0IHsgaW5zcGVjdCB9IGZyb20gXCJ1dGlsXCI7XG5pbXBvcnQgeyBDb21wYXJhdG9yLCBSYW5nZSwgcGFyc2UgfSBmcm9tIFwic2VtdmVyXCI7XG5cbmV4cG9ydCBlbnVtIFRhcmdldE5hbWUge1xuICBKQVZBLFxuICBET1RORVQsXG4gIFBZVEhPTixcbiAgR08sXG4gIEpBVkFTQ1JJUFQsXG59XG5cbi8qKlxuICogQ29udmVydHMgYSBTZW1WZXIgcmFuZ2UgZXhwcmVzc2lvbiB0byBhIE1hdmVuIHZlcnNpb24gcmFuZ2UgZXhwcmVzc2lvbi5cbiAqXG4gKiBAcGFyYW0gc2VtdmVyUmFuZ2UgdGhlIFNlbVZlciByYW5nZSBleHByZXNzaW9uIHRvIGNvbnZlcnQuXG4gKiBAcGFyYW0gc3VmZml4ICAgICAgdGhlIHN1ZmZpeCB0byBhZGQgdG8gdmVyc2lvbnMgaW4gdGhlIHJhbmdlLlxuICpcbiAqIEBzZWUgaHR0cHM6Ly9jd2lraS5hcGFjaGUub3JnL2NvbmZsdWVuY2UvZGlzcGxheS9NQVZFTk9MRC9EZXBlbmRlbmN5K01lZGlhdGlvbithbmQrQ29uZmxpY3QrUmVzb2x1dGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9NYXZlblZlcnNpb25SYW5nZShcbiAgc2VtdmVyUmFuZ2U6IHN0cmluZyxcbiAgc3VmZml4Pzogc3RyaW5nXG4pOiBzdHJpbmcge1xuICByZXR1cm4gdG9CcmFja2V0Tm90YXRpb24oc2VtdmVyUmFuZ2UsIHN1ZmZpeCwge1xuICAgIHNlbXZlcjogZmFsc2UsXG4gICAgdGFyZ2V0OiBUYXJnZXROYW1lLkpBVkEsXG4gIH0pO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgU2VtVmVyIHJhbmdlIGV4cHJlc3Npb24gdG8gYSBOdUdldCB2ZXJzaW9uIHJhbmdlIGV4cHJlc3Npb24uXG4gKlxuICogQHBhcmFtIHNlbXZlclJhbmdlIHRoZSBTZW1WZXIgcmFuZ2UgZXhwcmVzc2lvbiB0byBjb252ZXJ0LlxuICpcbiAqIEBzZWUgaHR0cHM6Ly9kb2NzLm1pY3Jvc29mdC5jb20vZW4tdXMvbnVnZXQvY29uY2VwdHMvcGFja2FnZS12ZXJzaW9uaW5nI3ZlcnNpb24tcmFuZ2VzLWFuZC13aWxkY2FyZHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvTnVHZXRWZXJzaW9uUmFuZ2Uoc2VtdmVyUmFuZ2U6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB0b0JyYWNrZXROb3RhdGlvbihzZW12ZXJSYW5nZSwgdW5kZWZpbmVkLCB7XG4gICAgc2VtdmVyOiBmYWxzZSxcbiAgICB0YXJnZXQ6IFRhcmdldE5hbWUuRE9UTkVULFxuICB9KTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIFNlbVZlciByYW5nZSBleHByZXNzaW9uIHRvIGEgUHl0aG9uIHNldHVwdG9vbHMgY29tcGF0aWJsZSB2ZXJzaW9uXG4gKiBjb25zdHJhaW50IGV4cHJlc3Npb24uXG4gKlxuICogQHBhcmFtIHNlbXZlclJhbmdlIHRoZSBTZW1WZXIgcmFuZ2UgZXhwcmVzc2lvbiB0byBjb252ZXJ0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9QeXRob25WZXJzaW9uUmFuZ2Uoc2VtdmVyUmFuZ2U6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHJhbmdlID0gbmV3IFJhbmdlKHNlbXZlclJhbmdlKTtcbiAgcmV0dXJuIHJhbmdlLnNldFxuICAgIC5tYXAoKHNldCkgPT5cbiAgICAgIHNldFxuICAgICAgICAubWFwKChjb21wKSA9PiB7XG4gICAgICAgICAgY29uc3QgdmVyc2lvbklkID0gdG9SZWxlYXNlVmVyc2lvbihcbiAgICAgICAgICAgIGNvbXAuc2VtdmVyLnJhdz8ucmVwbGFjZSgvLTAkLywgXCJcIikgPz8gXCIwLjAuMFwiLFxuICAgICAgICAgICAgVGFyZ2V0TmFtZS5QWVRIT05cbiAgICAgICAgICApO1xuICAgICAgICAgIHN3aXRjaCAoY29tcC5vcGVyYXRvcikge1xuICAgICAgICAgICAgY2FzZSBcIlwiOlxuICAgICAgICAgICAgICAvLyBXaXRoIF4wLjAuMCwgc29tZWhvdyB3ZSBnZXQgYSBsZWZ0IGVudHJ5IHdpdGggYW4gZW1wdHkgb3BlcmF0b3IgYW5kIHZhbHVlLCB3ZSdsbCBmaXggdGhpcyB1cFxuICAgICAgICAgICAgICByZXR1cm4gY29tcC52YWx1ZSA9PT0gXCJcIiA/IFwiPj0wLjAuMFwiIDogYD09JHt2ZXJzaW9uSWR9YDtcbiAgICAgICAgICAgIGNhc2UgXCI9XCI6XG4gICAgICAgICAgICAgIHJldHVybiBgPT0ke3ZlcnNpb25JZH1gO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgLy8gPiwgPj0sIDwsIDw9IGFyZSBhbGwgdmFsaWQgZXhwcmVzc2lvbnNcbiAgICAgICAgICAgICAgcmV0dXJuIGAke2NvbXAub3BlcmF0b3J9JHt2ZXJzaW9uSWR9YDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5qb2luKFwiLCBcIilcbiAgICApXG4gICAgLmpvaW4oXCIsIFwiKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbiBvcmlnaW5hbCB2ZXJzaW9uIG51bWJlciBmcm9tIHRoZSBOUE0gY29udmVudGlvbiB0byB0aGUgdGFyZ2V0XG4gKiBsYW5ndWFnZSdzIGNvbnZlbnRpb24gZm9yIGV4cHJlc3NpbmcgdGhlIHNhbWUuIEZvciB2ZXJzaW9ucyB0aGF0IGRvIG5vdFxuICogaW5jbHVkZSBhIHByZXJlbGVhc2UgaWRlbnRpZmllciwgdGhpcyBhbHdheXMgcmV0dXJucyB0aGUgYXNzZW1ibHkgdmVyc2lvblxuICogdW5tb2RpZmllZC5cbiAqXG4gKiBAcGFyYW0gYXNzZW1ibHlWZXJzaW9uIHRoZSBhc3NlbWJseSB2ZXJzaW9uIGJlaW5nIHJlbGVhc2VkXG4gKiBAcGFyYW0gdGFyZ2V0ICAgICAgICAgIHRoZSB0YXJnZXQgbGFuZ3VhZ2UgZm9yIHdoaWNoIHRoZSB2ZXJzaW9uIGlzIGRlc3RpbmVkXG4gKlxuICogQHJldHVybnMgdGhlIHZlcnNpb24gdGhhdCBzaG91bGQgYmUgc2VyaWFsaXplZFxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9SZWxlYXNlVmVyc2lvbihcbiAgYXNzZW1ibHlWZXJzaW9uOiBzdHJpbmcsXG4gIHRhcmdldDogVGFyZ2V0TmFtZVxuKTogc3RyaW5nIHtcbiAgY29uc3QgdmVyc2lvbiA9IHBhcnNlKGFzc2VtYmx5VmVyc2lvbik7XG4gIGlmICh2ZXJzaW9uID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgVW5hYmxlIHRvIHBhcnNlIHRoZSBwcm92aWRlZCBhc3NlbWJseSB2ZXJzaW9uOiBcIiR7YXNzZW1ibHlWZXJzaW9ufVwiYFxuICAgICk7XG4gIH1cbiAgaWYgKHZlcnNpb24ucHJlcmVsZWFzZS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gYXNzZW1ibHlWZXJzaW9uO1xuICB9XG4gIHN3aXRjaCAodGFyZ2V0KSB7XG4gICAgY2FzZSBUYXJnZXROYW1lLlBZVEhPTjpcbiAgICAgIGNvbnN0IGJhc2VWZXJzaW9uID0gYCR7dmVyc2lvbi5tYWpvcn0uJHt2ZXJzaW9uLm1pbm9yfS4ke3ZlcnNpb24ucGF0Y2h9YDtcblxuICAgICAgLy8gUHl0aG9uIHN1cHBvcnRzIGEgbGltaXRlZCBzZXQgb2YgaWRlbnRpZmllcnMuLi4gQW5kIHdlIGhhdmUgYSBtYXBwaW5nIHRhYmxlLi4uXG4gICAgICAvLyBodHRwczovL3BhY2thZ2luZy5weXRob24ub3JnL2d1aWRlcy9kaXN0cmlidXRpbmctcGFja2FnZXMtdXNpbmctc2V0dXB0b29scy8jcHJlLXJlbGVhc2UtdmVyc2lvbmluZ1xuICAgICAgY29uc3QgcmVsZWFzZUxhYmVsczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgICAgYWxwaGE6IFwiYVwiLFxuICAgICAgICBiZXRhOiBcImJcIixcbiAgICAgICAgcmM6IFwicmNcIixcbiAgICAgICAgcG9zdDogXCJwb3N0XCIsXG4gICAgICAgIGRldjogXCJkZXZcIixcbiAgICAgICAgcHJlOiBcInByZVwiLFxuICAgICAgfTtcblxuICAgICAgY29uc3QgdmFsaWRhdGlvbkVycm9yczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgLy8gRW5zdXJlIHRoYXQgcHJlcmVsZWFzZSBjb21wb3NlZCBlbnRpcmVseSBvZiBbbGFiZWwsIHNlcXVlbmNlXSBwYWlyc1xuICAgICAgdmVyc2lvbi5wcmVyZWxlYXNlLmZvckVhY2goKGVsZW0sIGlkeCwgYXJyKSA9PiB7XG4gICAgICAgIGNvbnN0IG5leHQ6IHN0cmluZyB8IG51bWJlciB8IHVuZGVmaW5lZCA9IGFycltpZHggKyAxXTtcbiAgICAgICAgaWYgKHR5cGVvZiBlbGVtID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgaWYgKCFPYmplY3Qua2V5cyhyZWxlYXNlTGFiZWxzKS5pbmNsdWRlcyhlbGVtKSkge1xuICAgICAgICAgICAgdmFsaWRhdGlvbkVycm9ycy5wdXNoKFxuICAgICAgICAgICAgICBgTGFiZWwgJHtlbGVtfSBpcyBub3Qgb25lIG9mICR7T2JqZWN0LmtleXMocmVsZWFzZUxhYmVscykuam9pbihcbiAgICAgICAgICAgICAgICBcIixcIlxuICAgICAgICAgICAgICApfWBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChuZXh0ID09PSB1bmRlZmluZWQgfHwgIU51bWJlci5pc0ludGVnZXIobmV4dCkpIHtcbiAgICAgICAgICAgIHZhbGlkYXRpb25FcnJvcnMucHVzaChcbiAgICAgICAgICAgICAgYExhYmVsICR7ZWxlbX0gbXVzdCBiZSBmb2xsb3dlZCBieSBhIHBvc2l0aXZlIGludGVnZXJgXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmICh2YWxpZGF0aW9uRXJyb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVbmFibGUgdG8gbWFwIHByZXJlbGVhc2UgaWRlbnRpZmllciAoaW46ICR7YXNzZW1ibHlWZXJzaW9ufSkgY29tcG9uZW50cyB0byBweXRob246ICR7aW5zcGVjdChcbiAgICAgICAgICAgIHZlcnNpb24ucHJlcmVsZWFzZVxuICAgICAgICAgICl9LiBUaGUgZm9ybWF0IHNob3VsZCBiZSAnWC5ZLlotW2xhYmVsLnNlcXVlbmNlXVsucG9zdC5zZXF1ZW5jZV1bLihkZXZ8cHJlKS5zZXF1ZW5jZV0nLCB3aGVyZSBzZXF1ZW5jZSBpcyBhIHBvc2l0aXZlIGludGVnZXIgYW5kIGxhYmVsIGlzIG9uZSBvZiAke2luc3BlY3QoXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhyZWxlYXNlTGFiZWxzKVxuICAgICAgICAgICl9LiBWYWxpZGF0aW9uIGVycm9ycyBlbmNvdW50ZXJlZDogJHt2YWxpZGF0aW9uRXJyb3JzLmpvaW4oXCIsIFwiKX1gXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vIFBFUDQ0MCBzdXBwb3J0cyBtdWx0aXBsZSBsYWJlbHMgaW4gYSBnaXZlbiB2ZXJzaW9uLCBzb1xuICAgICAgLy8gd2Ugc2hvdWxkIGF0dGVtcHQgdG8gaWRlbnRpZnkgYW5kIG1hcCBhcyBtYW55IGxhYmVscyBhc1xuICAgICAgLy8gcG9zc2libGUgZnJvbSB0aGUgZ2l2ZW4gcHJlcmVsZWFzZSBpbnB1dFxuICAgICAgLy8gZS5nLiAxLjIuMy1yYy4xMjMuZGV2LjQ1Ni5wb3N0Ljc4OSA9PiAxLjIuMy5yYzEyMy5kZXY0NTYucG9zdDc4OVxuICAgICAgY29uc3QgcG9zdElkeCA9IHZlcnNpb24ucHJlcmVsZWFzZS5maW5kSW5kZXgoXG4gICAgICAgICh2KSA9PiB2LnRvU3RyaW5nKCkgPT09IFwicG9zdFwiXG4gICAgICApO1xuICAgICAgY29uc3QgZGV2SWR4ID0gdmVyc2lvbi5wcmVyZWxlYXNlLmZpbmRJbmRleCgodikgPT5cbiAgICAgICAgW1wiZGV2XCIsIFwicHJlXCJdLmluY2x1ZGVzKHYudG9TdHJpbmcoKSlcbiAgICAgICk7XG4gICAgICBjb25zdCBwcmVSZWxlYXNlSWR4ID0gdmVyc2lvbi5wcmVyZWxlYXNlLmZpbmRJbmRleCgodikgPT5cbiAgICAgICAgW1wiYWxwaGFcIiwgXCJiZXRhXCIsIFwicmNcIl0uaW5jbHVkZXModi50b1N0cmluZygpKVxuICAgICAgKTtcbiAgICAgIGNvbnN0IHByZXJlbGVhc2VWZXJzaW9uID0gW1xuICAgICAgICBwcmVSZWxlYXNlSWR4ID4gLTFcbiAgICAgICAgICA/IGAke3JlbGVhc2VMYWJlbHNbdmVyc2lvbi5wcmVyZWxlYXNlW3ByZVJlbGVhc2VJZHhdXX0ke1xuICAgICAgICAgICAgICB2ZXJzaW9uLnByZXJlbGVhc2VbcHJlUmVsZWFzZUlkeCArIDFdID8/IDBcbiAgICAgICAgICAgIH1gXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIHBvc3RJZHggPiAtMVxuICAgICAgICAgID8gYHBvc3Qke3ZlcnNpb24ucHJlcmVsZWFzZVtwb3N0SWR4ICsgMV0gPz8gMH1gXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIGRldklkeCA+IC0xID8gYGRldiR7dmVyc2lvbi5wcmVyZWxlYXNlW2RldklkeCArIDFdID8/IDB9YCA6IHVuZGVmaW5lZCxcbiAgICAgIF1cbiAgICAgICAgLmZpbHRlcigodikgPT4gdilcbiAgICAgICAgLmpvaW4oXCIuXCIpO1xuXG4gICAgICByZXR1cm4gdmVyc2lvbi5idWlsZC5sZW5ndGggPiAwXG4gICAgICAgID8gYCR7YmFzZVZlcnNpb259LiR7cHJlcmVsZWFzZVZlcnNpb259KyR7dmVyc2lvbi5idWlsZC5qb2luKFwiLlwiKX1gXG4gICAgICAgIDogYCR7YmFzZVZlcnNpb259LiR7cHJlcmVsZWFzZVZlcnNpb259YDtcbiAgICBjYXNlIFRhcmdldE5hbWUuRE9UTkVUOlxuICAgIGNhc2UgVGFyZ2V0TmFtZS5HTzpcbiAgICBjYXNlIFRhcmdldE5hbWUuSkFWQTpcbiAgICBjYXNlIFRhcmdldE5hbWUuSkFWQVNDUklQVDpcbiAgICAgIC8vIE5vdCB0b3VjaGluZyAtIHRoZSBOUE0gdmVyc2lvbiBudW1iZXIgc2hvdWxkIGJlIHVzYWJsZSBhcy1pc1xuICAgICAgYnJlYWs7XG4gIH1cbiAgcmV0dXJuIGFzc2VtYmx5VmVyc2lvbjtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIHNlbWFudGljIHZlcnNpb24gcmFuZ2UgdG8gdGhlIGtpbmQgb2YgYnJhY2tldCBub3RhdGlvbiB1c2VkIGJ5XG4gKiBNYXZlbiBhbmQgTnVHZXQuIEZvciBleGFtcGxlLCB0aGlzIHR1cm5zIGBeMS4yLjNgIGludG8gYFsxLjIuMywyLjAuMClgLlxuICpcbiAqIEBwYXJhbSBzZW12ZXJSYW5nZSBUaGUgc2VtYW50aWMgdmVyc2lvbiByYW5nZSB0byBiZSBjb252ZXJ0ZWQuXG4gKiBAcGFyYW0gc3VmZml4IEEgdmVyc2lvbiBzdWZmaXggdG8gYXBwbHkgdG8gdmVyc2lvbnMgaW4gdGhlIHJlc3VsdGluZyBleHByZXNzaW9uLlxuICogQHBhcmFtIHNlbXZlciBXaGV0aGVyIHRoZSB0YXJnZXQgc3VwcG9ydHMgZnVsbCBzZW1hbnRpYyB2ZXJzaW9uaW5nIChpbmNsdWRpbmdcbiAqICAgICAgICAgICAgICAgYC0wYCBhcyB0aGUgbG93ZXN0IHBvc3NpYmxlIHByZXJlbGVhc2UgaWRlbnRpZmllcilcbiAqXG4gKiBAcmV0dXJucyBhIGJyYWNrZXQtbm90YXRpb24gdmVyc2lvbiByYW5nZS5cbiAqL1xuZnVuY3Rpb24gdG9CcmFja2V0Tm90YXRpb24oXG4gIHNlbXZlclJhbmdlOiBzdHJpbmcsXG4gIHN1ZmZpeD86IHN0cmluZyxcbiAge1xuICAgIHNlbXZlciA9IHRydWUsXG4gICAgdGFyZ2V0ID0gVGFyZ2V0TmFtZS5KQVZBU0NSSVBULFxuICB9OiB7IHNlbXZlcj86IGJvb2xlYW47IHRhcmdldD86IFRhcmdldE5hbWUgfSA9IHt9XG4pOiBzdHJpbmcge1xuICBpZiAoc2VtdmVyUmFuZ2UgPT09IFwiKlwiKSB7XG4gICAgc2VtdmVyUmFuZ2UgPSBcIj49MC4wLjBcIjtcbiAgfVxuXG4gIGNvbnN0IHJhbmdlID0gbmV3IFJhbmdlKHNlbXZlclJhbmdlKTtcbiAgaWYgKHNlbXZlclJhbmdlID09PSByYW5nZS5yYW5nZSkge1xuICAgIHJldHVybiBzZW12ZXJSYW5nZTtcbiAgfVxuXG4gIHJldHVybiByYW5nZS5zZXRcbiAgICAubWFwKChzZXQpID0+IHtcbiAgICAgIGlmIChzZXQubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGNvbnN0IHZlcnNpb24gPSBzZXRbMF0uc2VtdmVyLnJhdztcbiAgICAgICAgaWYgKCF2ZXJzaW9uICYmIHJhbmdlLnJhdyA9PT0gXCI+PTAuMC4wXCIpIHtcbiAgICAgICAgICAvLyBDYXNlIHdoZXJlIHZlcnNpb24gaXMgJyonXG4gICAgICAgICAgcmV0dXJuIFwiWzAuMC4wLClcIjtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKHNldFswXS5vcGVyYXRvciB8fCBcIj1cIikge1xuICAgICAgICAgIC8vIFwiW3ZlcnNpb25dXCIgPT4gbWVhbnMgZXhhY3RseSB2ZXJzaW9uXG4gICAgICAgICAgY2FzZSBcIj1cIjpcbiAgICAgICAgICAgIHJldHVybiBgWyR7YWRkU3VmZml4KHZlcnNpb24pfV1gO1xuICAgICAgICAgIC8vIFwiKHZlcnNpb24sXVwiID0+IG1lYW5zIGdyZWF0ZXIgdGhhbiB2ZXJzaW9uXG4gICAgICAgICAgY2FzZSBcIj5cIjpcbiAgICAgICAgICAgIHJldHVybiBgKCR7YWRkU3VmZml4KHZlcnNpb24pfSwpYDtcbiAgICAgICAgICAvLyBcIlt2ZXJzaW9uLF1cIiA9PiBtZWFucyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhhdCB2ZXJzaW9uXG4gICAgICAgICAgY2FzZSBcIj49XCI6XG4gICAgICAgICAgICByZXR1cm4gYFske2FkZFN1ZmZpeCh2ZXJzaW9uKX0sKWA7XG4gICAgICAgICAgLy8gXCJbLHZlcnNpb24pXCIgPT4gbWVhbnMgbGVzcyB0aGFuIHZlcnNpb25cbiAgICAgICAgICBjYXNlIFwiPFwiOlxuICAgICAgICAgICAgcmV0dXJuIGAoLCR7YWRkU3VmZml4KHZlcnNpb24sICFzZW12ZXIpfSlgO1xuICAgICAgICAgIC8vIFwiWyx2ZXJzaW9uXVwiID0+IG1lYW5zIGxlc3MgdGhhbiBvciBlcXVhbCB0byB2ZXJzaW9uXG4gICAgICAgICAgY2FzZSBcIjw9XCI6XG4gICAgICAgICAgICByZXR1cm4gYCgsJHthZGRTdWZmaXgodmVyc2lvbil9XWA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc2V0Lmxlbmd0aCA9PT0gMikge1xuICAgICAgICBjb25zdCBudWdldFJhbmdlID0gdG9CcmFja2V0UmFuZ2Uoc2V0WzBdLCBzZXRbMV0pO1xuICAgICAgICBpZiAobnVnZXRSYW5nZSkge1xuICAgICAgICAgIHJldHVybiBudWdldFJhbmdlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBVbnN1cHBvcnRlZCBTZW1WZXIgcmFuZ2Ugc2V0IGluICR7c2VtdmVyUmFuZ2V9OiAke3NldFxuICAgICAgICAgIC5tYXAoKGNvbXApID0+IGNvbXAudmFsdWUpXG4gICAgICAgICAgLmpvaW4oXCIsIFwiKX1gXG4gICAgICApO1xuICAgIH0pXG4gICAgLmpvaW4oXCIsIFwiKTtcblxuICBmdW5jdGlvbiB0b0JyYWNrZXRSYW5nZShcbiAgICBsZWZ0OiBDb21wYXJhdG9yLFxuICAgIHJpZ2h0OiBDb21wYXJhdG9yXG4gICk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKGxlZnQub3BlcmF0b3Iuc3RhcnRzV2l0aChcIjxcIikgJiYgcmlnaHQub3BlcmF0b3Iuc3RhcnRzV2l0aChcIj5cIikpIHtcbiAgICAgIC8vIE9yZGVyIGlzbid0IGlkZWFsLCBzd2FwIGFyb3VuZC4uXG4gICAgICBbbGVmdCwgcmlnaHRdID0gW3JpZ2h0LCBsZWZ0XTtcbiAgICB9XG5cbiAgICAvLyBXaXRoIF4wLjAuMCwgc29tZWhvdyB3ZSBnZXQgYSBsZWZ0IGVudHJ5IHdpdGggYW4gZW1wdHkgb3BlcmF0b3IgYW5kIHZhbHVlLCB3ZSdsbCBmaXggdGhpcyB1cFxuICAgIGlmIChsZWZ0Lm9wZXJhdG9yID09PSBcIlwiICYmIGxlZnQudmFsdWUgPT09IFwiXCIpIHtcbiAgICAgIGxlZnQgPSBuZXcgQ29tcGFyYXRvcihcIj49MC4wLjBcIiwgbGVmdC5vcHRpb25zKTtcbiAgICB9XG5cbiAgICBpZiAoIWxlZnQub3BlcmF0b3Iuc3RhcnRzV2l0aChcIj5cIikgfHwgIXJpZ2h0Lm9wZXJhdG9yLnN0YXJ0c1dpdGgoXCI8XCIpKSB7XG4gICAgICAvLyBXZSBvbmx5IHN1cHBvcnQgcmFuZ2VzIGRlZmluZWQgbGlrZSBcIj4gKG9yID49KSBsZWZ0LCA8IChvciA8PSkgcmlnaHRcIlxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCBsZWZ0QnJhY2UgPSBsZWZ0Lm9wZXJhdG9yLmVuZHNXaXRoKFwiPVwiKSA/IFwiW1wiIDogXCIoXCI7XG4gICAgY29uc3QgcmlnaHRCcmFjZSA9IHJpZ2h0Lm9wZXJhdG9yLmVuZHNXaXRoKFwiPVwiKSA/IFwiXVwiIDogXCIpXCI7XG4gICAgcmV0dXJuIGAke2xlZnRCcmFjZX0ke2FkZFN1ZmZpeChsZWZ0LnNlbXZlci5yYXcpfSwke2FkZFN1ZmZpeChcbiAgICAgIHJpZ2h0LnNlbXZlci5yYXcsXG4gICAgICByaWdodC5vcGVyYXRvciA9PT0gXCI8XCIgJiYgIXNlbXZlclxuICAgICl9JHtyaWdodEJyYWNlfWA7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRTdWZmaXgoc3RyOiBzdHJpbmcgfCB1bmRlZmluZWQsIHRyaW1EYXNoWmVybyA9IGZhbHNlKSB7XG4gICAgaWYgKCFzdHIpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICBpZiAodHJpbURhc2haZXJvKSB7XG4gICAgICBzdHIgPSBzdHIucmVwbGFjZSgvLTAkLywgXCJcIik7XG4gICAgfVxuICAgIHJldHVybiBzdWZmaXggPyBgJHtzdHJ9JHtzdWZmaXh9YCA6IHRvUmVsZWFzZVZlcnNpb24oc3RyLCB0YXJnZXQpO1xuICB9XG59XG4iXX0=