"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discover = discover;
exports.readManifest = readManifest;
exports.resolveProjectType = resolveProjectType;
exports.toProjectType = toProjectType;
exports.readJsiiManifest = readJsiiManifest;
const fs = require("fs");
const path = require("path");
const zlib_1 = require("zlib");
const case_1 = require("case");
const PROJEN_MODULE_ROOT = path.join(__dirname, "..");
const PROJECT_BASE_FQN = "projen.Project";
/**
 * Returns a list of project types exported the modules defined in `moduleDirs`.
 * This list will always also include the built-in projen project types.
 * Modules without a .jsii manifest are skipped.
 *
 * @param moduleDirs A list of npm module directories
 */
function discover(...moduleDirs) {
    const jsii = discoverJsiiTypes(...moduleDirs);
    const result = new Array();
    for (const fqn of Object.keys(jsii)) {
        if (isProjectType(jsii, fqn)) {
            const p = toProjectType(jsii, fqn);
            result.push(p);
        }
    }
    return result.sort((r1, r2) => r1.pjid.localeCompare(r2.pjid));
}
function readManifest(dir) {
    const jsiiFile = path.join(dir, ".jsii");
    if (!fs.existsSync(jsiiFile)) {
        return undefined;
    } // no jsii manifest
    let manifest = JSON.parse(fs.readFileSync(jsiiFile, "utf-8"));
    if (manifest.schema === "jsii/file-redirect") {
        const compressedFile = path.join(dir, manifest.filename);
        if (!fs.existsSync(compressedFile)) {
            throw new Error(`${compressedFile} does not exist.`);
        }
        switch (manifest.compression) {
            case "gzip":
                manifest = JSON.parse((0, zlib_1.unzipSync)(fs.readFileSync(compressedFile)).toString());
                break;
            default:
                throw new Error(`Unsupported compression format: ${manifest.compression}`);
        }
    }
    return manifest;
}
/**
 * Resolve all jsii types from @modulesDirs.
 * When a jsii module is found it will recusively list the types from the dependant module as well
 *
 * @param moduleDirs
 * @returns
 */
function discoverJsiiTypes(...moduleDirs) {
    const jsii = {};
    const discoveredManifests = [];
    const discoverJsii = (dir) => {
        const manifest = readManifest(dir);
        if (!manifest) {
            return;
        }
        if (discoveredManifests.includes(manifest.fingerprint)) {
            return;
        }
        discoveredManifests.push(manifest.fingerprint);
        for (const [fqn, type] of Object.entries(manifest.types)) {
            jsii[fqn] = {
                ...type,
            };
        }
        // Also search recursively in nested project dependencies. If the requested module is an external module
        // this will also end-up in the projen module and add the projen types
        if (manifest.dependencies) {
            for (const dependency of Object.keys(manifest.dependencies)) {
                const nestedDependencyFolder = path.dirname(require.resolve(`${dependency}/package.json`, {
                    paths: [dir],
                }));
                if (fs.existsSync(nestedDependencyFolder)) {
                    discoverJsii(nestedDependencyFolder);
                }
            }
        }
    };
    // read all .jsii manifests from all requested modules and merge
    // them all into a single map of fqn->type.
    for (const dir of [...moduleDirs, PROJEN_MODULE_ROOT]) {
        discoverJsii(dir);
        // Read from scoped packages
        if (dir.includes("@") && fs.lstatSync(dir).isDirectory()) {
            const childDirs = fs.readdirSync(dir).map((file) => path.join(dir, file));
            for (const child of childDirs) {
                discoverJsii(child);
            }
        }
    }
    return jsii;
}
function resolveProjectType(projectFqn) {
    let [moduleName] = projectFqn.split(".");
    if (moduleName === "projen") {
        moduleName = PROJEN_MODULE_ROOT;
    }
    // try picking the manifest. We only need the base folder but this is directly a nice check if we request from a valid jsii package
    const jsiiManifestFile = require.resolve(`${moduleName}/.jsii`, {
        paths: [process.cwd()],
    });
    const moduleFolder = path.dirname(jsiiManifestFile);
    // Read all jsii types that can be loaded from this project type
    const jsii = discoverJsiiTypes(moduleFolder);
    return toProjectType(jsii, projectFqn);
}
function toProjectType(jsii, fqn) {
    if (!isProjectType(jsii, fqn)) {
        throw new Error(`Fully qualified name "${fqn}" is not a valid project type.`);
    }
    const typeinfo = jsii[fqn];
    // projen.web.ReactProject -> web.ReactProject
    const typename = fqn.substring(fqn.indexOf(".") + 1);
    // projen.web.ReactProject -> web
    // projen.Project -> projen
    const readmeFileName = typename.includes(".")
        ? typename.split(".", 1)[0]
        : typeinfo.assembly;
    // * [java](https://projen.io/docs/api/java#javaproject-) - Java project.
    const docsurl = `https://projen.io/docs/api/${readmeFileName}#${typename
        .substring(typename.indexOf(".") + 1)
        .toLowerCase()}-`;
    let pjid = typeinfo.docs?.custom?.pjid ?? (0, case_1.snake)(typename).replace(/_project$/, "");
    return {
        moduleName: typeinfo.assembly,
        typename,
        pjid,
        fqn,
        options: discoverOptions(jsii, fqn),
        docs: typeinfo.docs?.summary,
        docsurl,
    };
}
function readJsiiManifest(jsiiFqn) {
    let [moduleName] = jsiiFqn.split(".");
    if (moduleName === "projen") {
        moduleName = PROJEN_MODULE_ROOT;
    }
    const jsiiManifestFile = require.resolve(`${moduleName}/.jsii`);
    return JSON.parse(fs.readFileSync(jsiiManifestFile, "utf-8"));
}
function discoverOptions(jsii, fqn) {
    const options = {};
    const params = jsii[fqn]?.initializer?.parameters ?? [];
    const optionsParam = params[0];
    const optionsTypeFqn = optionsParam?.type?.fqn;
    if (params.length > 1 ||
        (params.length === 1 && optionsParam?.name !== "options")) {
        throw new Error(`constructor for project ${fqn} must have a single "options" argument of a struct type. got ${JSON.stringify(params)}`);
    }
    addOptions(optionsTypeFqn);
    const opts = Object.values(options);
    return opts.sort((a, b) => a.name.localeCompare(b.name));
    function addOptions(ofqn, basePath = [], optional = false) {
        if (!ofqn) {
            return;
        }
        const struct = jsii[ofqn];
        if (!struct) {
            throw new Error(`unable to find options type ${ofqn} for project ${fqn}`);
        }
        for (const prop of struct.properties ?? []) {
            const propPath = [...basePath, prop.name];
            // protect against double-booking
            if (prop.name in options) {
                throw new Error(`duplicate option "${prop.name}" in ${fqn} (already declared in ${options[prop.name].parent})`);
            }
            let jsiiKind;
            if (prop.type?.fqn) {
                jsiiKind = jsii[prop.type?.fqn].kind; // e.g. 'class', 'interface', 'enum'
            }
            const isOptional = optional || prop.optional;
            const defaultValue = sanitizeValue(prop.docs?.default);
            const pjnew = sanitizeValue(prop.docs?.custom?.pjnew);
            // if this is a mandatory option and we have a default value,
            // or the option is tagged to be rendered with an initial value,
            // the value has to be JSON-parsable to the correct type
            const initialValue = getInitialValue(defaultValue, pjnew, isOptional);
            if (initialValue) {
                checkDefaultIsParsable(prop.name, initialValue, prop.type);
            }
            options[prop.name] = filterUndefined({
                path: propPath,
                parent: struct.name,
                name: prop.name,
                fqn: prop.type?.fqn,
                docs: prop.docs.summary,
                simpleType: prop.type ? getSimpleTypeName(prop.type) : "unknown",
                fullType: prop.type,
                kind: jsiiKind,
                jsonLike: prop.type ? isJsonLike(jsii, prop.type) : undefined,
                switch: propPath.map((p) => (0, case_1.snake)(p).replace(/_/g, "-")).join("-"),
                default: defaultValue,
                initialValue: initialValue,
                optional: isOptional,
                featured: prop.docs?.custom?.featured === "true",
                deprecated: prop.docs.stability === "deprecated" ? true : undefined,
            });
        }
        for (const ifc of struct.interfaces ?? []) {
            addOptions(ifc);
        }
    }
}
function getInitialValue(defaultValue, pjnew, isOptional = false) {
    if (pjnew) {
        return pjnew;
    }
    if (!isOptional) {
        return defaultValue;
    }
    return undefined;
}
function sanitizeValue(val) {
    if (val === "undefined") {
        return undefined;
    }
    return val;
}
function getSimpleTypeName(type) {
    if (type?.primitive) {
        return type.primitive; // e.g. 'string', 'boolean', 'number'
    }
    else if (type?.fqn) {
        return type.fqn.split(".").pop(); // projen.NodeProjectOptions -> NodeProjectOptions
    }
    else {
        // any other types such as collection types
        return "unknown";
    }
}
/**
 * Whether a value of this type is serializable into JSON.
 */
function isJsonLike(jsii, type) {
    if (type.primitive) {
        // string, boolean, number, any
        return true;
    }
    else if (type.fqn) {
        const kind = jsii[type.fqn].kind;
        if (["interface", "enum"].includes(kind)) {
            // not 'class'
            return true;
        }
    }
    else if (type.collection) {
        return isJsonLike(jsii, type.collection.elementtype);
    }
    return false;
}
function filterUndefined(obj) {
    const ret = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined) {
            ret[k] = v;
        }
    }
    return ret;
}
function isProjectType(jsii, fqn) {
    const type = jsii[fqn];
    if (!type) {
        throw new Error(`Could not find project type with fqn "${fqn}" in  .jsii file.`);
    }
    if (type.kind !== "class") {
        return false;
    }
    if (type.abstract) {
        return false;
    }
    if (type.docs?.deprecated) {
        return false;
    }
    let curr = type;
    while (true) {
        if (curr.fqn === PROJECT_BASE_FQN) {
            return true;
        }
        if (!curr.base) {
            return false;
        }
        curr = jsii[curr.base];
        if (!curr) {
            return false;
        }
    }
}
function isPrimitiveArray({ collection }) {
    return Boolean(collection?.kind === "array" && collection?.elementtype.primitive);
}
function isPrimitiveOrPrimitiveArray(type) {
    return Boolean(type?.primitive || isPrimitiveArray(type));
}
function checkDefaultIsParsable(prop, value, type) {
    if (!(type && isPrimitiveOrPrimitiveArray(type))) {
        throw new Error(`required option "${prop}" with a @default must use primitive types (string, number and boolean) or a primitive array. type found is: ${JSON.stringify(type)}`);
    }
    // macros are pass-through
    if (value.startsWith("$")) {
        return;
    }
    try {
        const parsed = JSON.parse(value);
        // Primitive type
        if (typeof parsed === type.primitive) {
            return;
        }
        // Primitive array
        if (Array.isArray(parsed) && isPrimitiveArray(type)) {
            // but empty (which is okay)
            if (parsed.length === 0) {
                return;
            }
            // if first element matches the type, assume it's correct
            if (typeof parsed[0] === type?.collection?.elementtype.primitive) {
                return;
            }
        }
        // Parsed value does not match type
        throw new Error(`cannot parse @default value for mandatory option ${prop} as a ${type}: ${parsed}`);
    }
    catch (e) {
        throw new Error(`unable to JSON.parse() value "${value}" specified as @default for mandatory option "${prop}": ${e.message}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52ZW50b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2ludmVudG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQStGQSw0QkFhQztBQUVELG9DQTRCQztBQWlFRCxnREFlQztBQUVELHNDQWtDQztBQUVELDRDQVFDO0FBeFFELHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0IsK0JBQWlDO0FBQ2pDLCtCQUE2QjtBQUU3QixNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3RELE1BQU0sZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7QUFrRjFDOzs7Ozs7R0FNRztBQUNILFNBQWdCLFFBQVEsQ0FBQyxHQUFHLFVBQW9CO0lBQzlDLE1BQU0sSUFBSSxHQUFHLGlCQUFpQixDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUM7SUFFOUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxLQUFLLEVBQWUsQ0FBQztJQUV4QyxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUNwQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUM3QixNQUFNLENBQUMsR0FBRyxhQUFhLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakIsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNqRSxDQUFDO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLEdBQVc7SUFDdEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUks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QUFTLEVBQUUsQ0FBQztnQkFDakUsT0FBTztZQUNULENBQUM7UUFDSCxDQUFDO1FBRUQsbUNBQW1DO1FBQ25DLE1BQU0sSUFBSSxLQUFLLENBQ2Isb0RBQW9ELElBQUksU0FBUyxJQUFJLEtBQUssTUFBTSxFQUFFLENBQ25GLENBQUM7SUFDSixDQUFDO0lBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUNYLE1BQU0sSUFBSSxLQUFLLENBQ2IsaUNBQWlDLEtBQUssaURBQWlELElBQUksTUFDeEYsQ0FBUyxDQUFDLE9BQ2IsRUFBRSxDQUNILENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgdW56aXBTeW5jIH0gZnJvbSBcInpsaWJcIjtcbmltcG9ydCB7IHNuYWtlIH0gZnJvbSBcImNhc2VcIjtcblxuY29uc3QgUFJPSkVOX01PRFVMRV9ST09UID0gcGF0aC5qb2luKF9fZGlybmFtZSwgXCIuLlwiKTtcbmNvbnN0IFBST0pFQ1RfQkFTRV9GUU4gPSBcInByb2plbi5Qcm9qZWN0XCI7XG5cbnR5cGUgSnNpaVR5cGVzID0geyBbbmFtZTogc3RyaW5nXTogSnNpaVR5cGUgfTtcblxuZXhwb3J0IGludGVyZmFjZSBQcm9qZWN0T3B0aW9uIHtcbiAgcGF0aDogc3RyaW5nW107XG4gIG5hbWU6IHN0cmluZztcbiAgZnFuPzogc3RyaW5nO1xuICBzd2l0Y2g6IHN0cmluZztcbiAgLyoqIFNpbXBsZSB0eXBlIG5hbWUsIGUuZy4gXCJzdHJpbmdcIiwgXCJib29sZWFuXCIsIFwibnVtYmVyXCIsIFwiRXNsaW50T3B0aW9uc1wiLCBcIk15RW51bVwiLiBDb2xsZWN0aW9ucyBhcmUgXCJ1bmtub3duXCIgKi9cbiAgc2ltcGxlVHlwZTogc3RyaW5nO1xuICAvKiogRnVsbCBKU0lJIHR5cGUsIGUuZy4geyBwcmltaXRpdmU6IFwic3RyaW5nXCIgfSBvciB7IGNvbGxlY3Rpb246IHsgZWxlbWVudHR5cGU6IHsgcHJpbWl0aXZlOiAnc3RyaW5nJyB9LCBraW5kOiAnbWFwJyB9IH0gKi9cbiAgZnVsbFR5cGU6IEpzaWlQcm9wZXJ0eVR5cGU7XG4gIGtpbmQ/OiBcImNsYXNzXCIgfCBcImVudW1cIiB8IFwiaW50ZXJmYWNlXCI7XG4gIGpzb25MaWtlPzogYm9vbGVhbjtcbiAgcGFyZW50OiBzdHJpbmc7XG4gIGRvY3M/OiBzdHJpbmc7XG4gIGRlZmF1bHQ/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUaGUgdmFsdWUgdGhhdCB3aWxsIGJlIHVzZWQgYXQgaW5pdGlhbCBwcm9qZWN0IGNyZWF0aW9uXG4gICAqL1xuICBpbml0aWFsVmFsdWU/OiBzdHJpbmc7XG4gIG9wdGlvbmFsPzogYm9vbGVhbjtcbiAgZGVwcmVjYXRlZD86IGJvb2xlYW47XG4gIGZlYXR1cmVkPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcm9qZWN0VHlwZSB7XG4gIG1vZHVsZU5hbWU6IHN0cmluZztcbiAgcGppZDogc3RyaW5nO1xuICBmcW46IHN0cmluZztcbiAgdHlwZW5hbWU6IHN0cmluZztcbiAgb3B0aW9uczogUHJvamVjdE9wdGlvbltdO1xuICBkb2NzPzogc3RyaW5nO1xuICBkb2NzdXJsOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBKc2lpVHlwZSB7XG4gIG5hbWU6IHN0cmluZztcbiAgYXNzZW1ibHk6IHN0cmluZztcbiAga2luZDogc3RyaW5nO1xuICBhYnN0cmFjdD86IGJvb2xlYW47XG4gIGJhc2U/OiBzdHJpbmc7XG4gIGZxbjogc3RyaW5nO1xuICBpbnRlcmZhY2VzPzogc3RyaW5nW107XG4gIGluaXRpYWxpemVyPzoge1xuICAgIHBhcmFtZXRlcnM/OiBBcnJheTx7XG4gICAgICBuYW1lOiBzdHJpbmc7XG4gICAgICB0eXBlPzogeyBmcW4/OiBzdHJpbmcgfTtcbiAgICB9PjtcbiAgfTtcbiAgcHJvcGVydGllcz86IEFycmF5PHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgZG9jczoge1xuICAgICAgc3VtbWFyeT86IHN0cmluZztcbiAgICAgIGRlZmF1bHQ/OiBzdHJpbmc7XG4gICAgICBkZXByZWNhdGVkPzogc3RyaW5nO1xuICAgICAgc3RhYmlsaXR5Pzogc3RyaW5nO1xuICAgICAgY3VzdG9tPzogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH07XG4gICAgfTtcbiAgICBvcHRpb25hbD86IGJvb2xlYW47XG4gICAgdHlwZT86IEpzaWlQcm9wZXJ0eVR5cGU7XG4gIH0+O1xuICBkb2NzPzoge1xuICAgIHN1bW1hcnk/OiBzdHJpbmc7XG4gICAgZGVwcmVjYXRlZD86IHN0cmluZztcbiAgICBjdXN0b20/OiB7XG4gICAgICBwamlkPzogc3RyaW5nO1xuICAgICAgcGpuZXc/OiBzdHJpbmc7XG4gICAgfTtcbiAgfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBKc2lpUHJvcGVydHlUeXBlIHtcbiAgcHJpbWl0aXZlPzogc3RyaW5nO1xuICBmcW4/OiBzdHJpbmc7XG4gIGNvbGxlY3Rpb24/OiB7XG4gICAgZWxlbWVudHR5cGU6IEpzaWlQcm9wZXJ0eVR5cGU7XG4gICAga2luZDogc3RyaW5nO1xuICB9O1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBsaXN0IG9mIHByb2plY3QgdHlwZXMgZXhwb3J0ZWQgdGhlIG1vZHVsZXMgZGVmaW5lZCBpbiBgbW9kdWxlRGlyc2AuXG4gKiBUaGlzIGxpc3Qgd2lsbCBhbHdheXMgYWxzbyBpbmNsdWRlIHRoZSBidWlsdC1pbiBwcm9qZW4gcHJvamVjdCB0eXBlcy5cbiAqIE1vZHVsZXMgd2l0aG91dCBhIC5qc2lpIG1hbmlmZXN0IGFyZSBza2lwcGVkLlxuICpcbiAqIEBwYXJhbSBtb2R1bGVEaXJzIEEgbGlzdCBvZiBucG0gbW9kdWxlIGRpcmVjdG9yaWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNjb3ZlciguLi5tb2R1bGVEaXJzOiBzdHJpbmdbXSk6IFByb2plY3RUeXBlW10ge1xuICBjb25zdCBqc2lpID0gZGlzY292ZXJKc2lpVHlwZXMoLi4ubW9kdWxlRGlycyk7XG5cbiAgY29uc3QgcmVzdWx0ID0gbmV3IEFycmF5PFByb2plY3RUeXBlPigpO1xuXG4gIGZvciAoY29uc3QgZnFuIG9mIE9iamVjdC5rZXlzKGpzaWkpKSB7XG4gICAgaWYgKGlzUHJvamVjdFR5cGUoanNpaSwgZnFuKSkge1xuICAgICAgY29uc3QgcCA9IHRvUHJvamVjdFR5cGUoanNpaSwgZnFuKTtcbiAgICAgIHJlc3VsdC5wdXNoKHApO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQuc29ydCgocjEsIHIyKSA9PiByMS5wamlkLmxvY2FsZUNvbXBhcmUocjIucGppZCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZE1hbmlmZXN0KGRpcjogc3RyaW5nKSB7XG4gIGNvbnN0IGpzaWlGaWxlID0gcGF0aC5qb2luKGRpciwgXCIuanNpaVwiKTtcbiAgaWYgKCFmcy5leGlzdHNTeW5jKGpzaWlGaWxlKSkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0gLy8gbm8ganNpaSBtYW5pZmVzdFxuICBsZXQgbWFuaWZlc3QgPSBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhqc2lpRmlsZSwgXCJ1dGYtOFwiKSk7XG5cbiAgaWYgKG1hbmlmZXN0LnNjaGVtYSA9PT0gXCJqc2lpL2ZpbGUtcmVkaXJlY3RcIikge1xuICAgIGNvbnN0IGNvbXByZXNzZWRGaWxlID0gcGF0aC5qb2luKGRpciwgbWFuaWZlc3QuZmlsZW5hbWUpO1xuXG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGNvbXByZXNzZWRGaWxlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke2NvbXByZXNzZWRGaWxlfSBkb2VzIG5vdCBleGlzdC5gKTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKG1hbmlmZXN0LmNvbXByZXNzaW9uKSB7XG4gICAgICBjYXNlIFwiZ3ppcFwiOlxuICAgICAgICBtYW5pZmVzdCA9IEpTT04ucGFyc2UoXG4gICAgICAgICAgdW56aXBTeW5jKGZzLnJlYWRGaWxlU3luYyhjb21wcmVzc2VkRmlsZSkpLnRvU3RyaW5nKClcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVuc3VwcG9ydGVkIGNvbXByZXNzaW9uIGZvcm1hdDogJHttYW5pZmVzdC5jb21wcmVzc2lvbn1gXG4gICAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1hbmlmZXN0O1xufVxuXG4vKipcbiAqIFJlc29sdmUgYWxsIGpzaWkgdHlwZXMgZnJvbSBAbW9kdWxlc0RpcnMuXG4gKiBXaGVuIGEganNpaSBtb2R1bGUgaXMgZm91bmQgaXQgd2lsbCByZWN1c2l2ZWx5IGxpc3QgdGhlIHR5cGVzIGZyb20gdGhlIGRlcGVuZGFudCBtb2R1bGUgYXMgd2VsbFxuICpcbiAqIEBwYXJhbSBtb2R1bGVEaXJzXG4gKiBAcmV0dXJuc1xuICovXG5mdW5jdGlvbiBkaXNjb3ZlckpzaWlUeXBlcyguLi5tb2R1bGVEaXJzOiBzdHJpbmdbXSkge1xuICBjb25zdCBqc2lpOiBKc2lpVHlwZXMgPSB7fTtcbiAgY29uc3QgZGlzY292ZXJlZE1hbmlmZXN0czogQXJyYXk8c3RyaW5nPiA9IFtdO1xuXG4gIGNvbnN0IGRpc2NvdmVySnNpaSA9IChkaXI6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IG1hbmlmZXN0ID0gcmVhZE1hbmlmZXN0KGRpcik7XG5cbiAgICBpZiAoIW1hbmlmZXN0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGRpc2NvdmVyZWRNYW5pZmVzdHMuaW5jbHVkZXMobWFuaWZlc3QuZmluZ2VycHJpbnQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGRpc2NvdmVyZWRNYW5pZmVzdHMucHVzaChtYW5pZmVzdC5maW5nZXJwcmludCk7XG5cbiAgICBmb3IgKGNvbnN0IFtmcW4sIHR5cGVdIG9mIE9iamVjdC5lbnRyaWVzKG1hbmlmZXN0LnR5cGVzIGFzIEpzaWlUeXBlcykpIHtcbiAgICAgIGpzaWlbZnFuXSA9IHtcbiAgICAgICAgLi4udHlwZSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gQWxzbyBzZWFyY2ggcmVjdXJzaXZlbHkgaW4gbmVzdGVkIHByb2plY3QgZGVwZW5kZW5jaWVzLiBJZiB0aGUgcmVxdWVzdGVkIG1vZHVsZSBpcyBhbiBleHRlcm5hbCBtb2R1bGVcbiAgICAvLyB0aGlzIHdpbGwgYWxzbyBlbmQtdXAgaW4gdGhlIHByb2plbiBtb2R1bGUgYW5kIGFkZCB0aGUgcHJvamVuIHR5cGVzXG4gICAgaWYgKG1hbmlmZXN0LmRlcGVuZGVuY2llcykge1xuICAgICAgZm9yIChjb25zdCBkZXBlbmRlbmN5IG9mIE9iamVjdC5rZXlzKG1hbmlmZXN0LmRlcGVuZGVuY2llcykpIHtcbiAgICAgICAgY29uc3QgbmVzdGVkRGVwZW5kZW5jeUZvbGRlciA9IHBhdGguZGlybmFtZShcbiAgICAgICAgICByZXF1aXJlLnJlc29sdmUoYCR7ZGVwZW5kZW5jeX0vcGFja2FnZS5qc29uYCwge1xuICAgICAgICAgICAgcGF0aHM6IFtkaXJdLFxuICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMobmVzdGVkRGVwZW5kZW5jeUZvbGRlcikpIHtcbiAgICAgICAgICBkaXNjb3ZlckpzaWkobmVzdGVkRGVwZW5kZW5jeUZvbGRlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gcmVhZCBhbGwgLmpzaWkgbWFuaWZlc3RzIGZyb20gYWxsIHJlcXVlc3RlZCBtb2R1bGVzIGFuZCBtZXJnZVxuICAvLyB0aGVtIGFsbCBpbnRvIGEgc2luZ2xlIG1hcCBvZiBmcW4tPnR5cGUuXG4gIGZvciAoY29uc3QgZGlyIG9mIFsuLi5tb2R1bGVEaXJzLCBQUk9KRU5fTU9EVUxFX1JPT1RdKSB7XG4gICAgZGlzY292ZXJKc2lpKGRpcik7XG5cbiAgICAvLyBSZWFkIGZyb20gc2NvcGVkIHBhY2thZ2VzXG4gICAgaWYgKGRpci5pbmNsdWRlcyhcIkBcIikgJiYgZnMubHN0YXRTeW5jKGRpcikuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgY29uc3QgY2hpbGREaXJzID0gZnMucmVhZGRpclN5bmMoZGlyKS5tYXAoKGZpbGUpID0+IHBhdGguam9pbihkaXIsIGZpbGUpKTtcbiAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGREaXJzKSB7XG4gICAgICAgIGRpc2NvdmVySnNpaShjaGlsZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGpzaWk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlUHJvamVjdFR5cGUocHJvamVjdEZxbjogc3RyaW5nKTogUHJvamVjdFR5cGUge1xuICBsZXQgW21vZHVsZU5hbWVdID0gcHJvamVjdEZxbi5zcGxpdChcIi5cIik7XG4gIGlmIChtb2R1bGVOYW1lID09PSBcInByb2plblwiKSB7XG4gICAgbW9kdWxlTmFtZSA9IFBST0pFTl9NT0RVTEVfUk9PVDtcbiAgfVxuXG4gIC8vIHRyeSBwaWNraW5nIHRoZSBtYW5pZmVzdC4gV2Ugb25seSBuZWVkIHRoZSBiYXNlIGZvbGRlciBidXQgdGhpcyBpcyBkaXJlY3RseSBhIG5pY2UgY2hlY2sgaWYgd2UgcmVxdWVzdCBmcm9tIGEgdmFsaWQganNpaSBwYWNrYWdlXG4gIGNvbnN0IGpzaWlNYW5pZmVzdEZpbGUgPSByZXF1aXJlLnJlc29sdmUoYCR7bW9kdWxlTmFtZX0vLmpzaWlgLCB7XG4gICAgcGF0aHM6IFtwcm9jZXNzLmN3ZCgpXSxcbiAgfSk7XG4gIGNvbnN0IG1vZHVsZUZvbGRlciA9IHBhdGguZGlybmFtZShqc2lpTWFuaWZlc3RGaWxlKTtcblxuICAvLyBSZWFkIGFsbCBqc2lpIHR5cGVzIHRoYXQgY2FuIGJlIGxvYWRlZCBmcm9tIHRoaXMgcHJvamVjdCB0eXBlXG4gIGNvbnN0IGpzaWkgPSBkaXNjb3ZlckpzaWlUeXBlcyhtb2R1bGVGb2xkZXIpO1xuICByZXR1cm4gdG9Qcm9qZWN0VHlwZShqc2lpLCBwcm9qZWN0RnFuKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvUHJvamVjdFR5cGUoanNpaTogSnNpaVR5cGVzLCBmcW46IHN0cmluZyk6IFByb2plY3RUeXBlIHtcbiAgaWYgKCFpc1Byb2plY3RUeXBlKGpzaWksIGZxbikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgRnVsbHkgcXVhbGlmaWVkIG5hbWUgXCIke2Zxbn1cIiBpcyBub3QgYSB2YWxpZCBwcm9qZWN0IHR5cGUuYFxuICAgICk7XG4gIH1cblxuICBjb25zdCB0eXBlaW5mbyA9IGpzaWlbZnFuXTtcblxuICAvLyBwcm9qZW4ud2ViLlJlYWN0UHJvamVjdCAtPiB3ZWIuUmVhY3RQcm9qZWN0XG4gIGNvbnN0IHR5cGVuYW1lID0gZnFuLnN1YnN0cmluZyhmcW4uaW5kZXhPZihcIi5cIikgKyAxKTtcblxuICAvLyBwcm9qZW4ud2ViLlJlYWN0UHJvamVjdCAtPiB3ZWJcbiAgLy8gcHJvamVuLlByb2plY3QgLT4gcHJvamVuXG4gIGNvbnN0IHJlYWRtZUZpbGVOYW1lID0gdHlwZW5hbWUuaW5jbHVkZXMoXCIuXCIpXG4gICAgPyB0eXBlbmFtZS5zcGxpdChcIi5cIiwgMSlbMF1cbiAgICA6IHR5cGVpbmZvLmFzc2VtYmx5O1xuXG4gIC8vICogW2phdmFdKGh0dHBzOi8vcHJvamVuLmlvL2RvY3MvYXBpL2phdmEjamF2YXByb2plY3QtKSAtIEphdmEgcHJvamVjdC5cblxuICBjb25zdCBkb2NzdXJsID0gYGh0dHBzOi8vcHJvamVuLmlvL2RvY3MvYXBpLyR7cmVhZG1lRmlsZU5hbWV9IyR7dHlwZW5hbWVcbiAgICAuc3Vic3RyaW5nKHR5cGVuYW1lLmluZGV4T2YoXCIuXCIpICsgMSlcbiAgICAudG9Mb3dlckNhc2UoKX0tYDtcbiAgbGV0IHBqaWQgPVxuICAgIHR5cGVpbmZvLmRvY3M/LmN1c3RvbT8ucGppZCA/PyBzbmFrZSh0eXBlbmFtZSkucmVwbGFjZSgvX3Byb2plY3QkLywgXCJcIik7XG4gIHJldHVybiB7XG4gICAgbW9kdWxlTmFtZTogdHlwZWluZm8uYXNzZW1ibHksXG4gICAgdHlwZW5hbWUsXG4gICAgcGppZCxcbiAgICBmcW4sXG4gICAgb3B0aW9uczogZGlzY292ZXJPcHRpb25zKGpzaWksIGZxbiksXG4gICAgZG9jczogdHlwZWluZm8uZG9jcz8uc3VtbWFyeSxcbiAgICBkb2NzdXJsLFxuICB9IGFzIFByb2plY3RUeXBlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZEpzaWlNYW5pZmVzdChqc2lpRnFuOiBzdHJpbmcpOiBhbnkge1xuICBsZXQgW21vZHVsZU5hbWVdID0ganNpaUZxbi5zcGxpdChcIi5cIik7XG4gIGlmIChtb2R1bGVOYW1lID09PSBcInByb2plblwiKSB7XG4gICAgbW9kdWxlTmFtZSA9IFBST0pFTl9NT0RVTEVfUk9PVDtcbiAgfVxuXG4gIGNvbnN0IGpzaWlNYW5pZmVzdEZpbGUgPSByZXF1aXJlLnJlc29sdmUoYCR7bW9kdWxlTmFtZX0vLmpzaWlgKTtcbiAgcmV0dXJuIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGpzaWlNYW5pZmVzdEZpbGUsIFwidXRmLThcIikpO1xufVxuXG5mdW5jdGlvbiBkaXNjb3Zlck9wdGlvbnMoanNpaTogSnNpaVR5cGVzLCBmcW46IHN0cmluZyk6IFByb2plY3RPcHRpb25bXSB7XG4gIGNvbnN0IG9wdGlvbnM6IHsgW25hbWU6IHN0cmluZ106IFByb2plY3RPcHRpb24gfSA9IHt9O1xuICBjb25zdCBwYXJhbXMgPSBqc2lpW2Zxbl0/LmluaXRpYWxpemVyPy5wYXJhbWV0ZXJzID8/IFtdO1xuICBjb25zdCBvcHRpb25zUGFyYW0gPSBwYXJhbXNbMF07XG4gIGNvbnN0IG9wdGlvbnNUeXBlRnFuID0gb3B0aW9uc1BhcmFtPy50eXBlPy5mcW47XG5cbiAgaWYgKFxuICAgIHBhcmFtcy5sZW5ndGggPiAxIHx8XG4gICAgKHBhcmFtcy5sZW5ndGggPT09IDEgJiYgb3B0aW9uc1BhcmFtPy5uYW1lICE9PSBcIm9wdGlvbnNcIilcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYGNvbnN0cnVjdG9yIGZvciBwcm9qZWN0ICR7ZnFufSBtdXN0IGhhdmUgYSBzaW5nbGUgXCJvcHRpb25zXCIgYXJndW1lbnQgb2YgYSBzdHJ1Y3QgdHlwZS4gZ290ICR7SlNPTi5zdHJpbmdpZnkoXG4gICAgICAgIHBhcmFtc1xuICAgICAgKX1gXG4gICAgKTtcbiAgfVxuXG4gIGFkZE9wdGlvbnMob3B0aW9uc1R5cGVGcW4pO1xuXG4gIGNvbnN0IG9wdHMgPSBPYmplY3QudmFsdWVzKG9wdGlvbnMpO1xuXG4gIHJldHVybiBvcHRzLnNvcnQoKGEsIGIpID0+IGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSkpO1xuXG4gIGZ1bmN0aW9uIGFkZE9wdGlvbnMoXG4gICAgb2Zxbj86IHN0cmluZyxcbiAgICBiYXNlUGF0aDogc3RyaW5nW10gPSBbXSxcbiAgICBvcHRpb25hbCA9IGZhbHNlXG4gICkge1xuICAgIGlmICghb2Zxbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHN0cnVjdCA9IGpzaWlbb2Zxbl07XG4gICAgaWYgKCFzdHJ1Y3QpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5hYmxlIHRvIGZpbmQgb3B0aW9ucyB0eXBlICR7b2Zxbn0gZm9yIHByb2plY3QgJHtmcW59YCk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBwcm9wIG9mIHN0cnVjdC5wcm9wZXJ0aWVzID8/IFtdKSB7XG4gICAgICBjb25zdCBwcm9wUGF0aCA9IFsuLi5iYXNlUGF0aCwgcHJvcC5uYW1lXTtcblxuICAgICAgLy8gcHJvdGVjdCBhZ2FpbnN0IGRvdWJsZS1ib29raW5nXG4gICAgICBpZiAocHJvcC5uYW1lIGluIG9wdGlvbnMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBkdXBsaWNhdGUgb3B0aW9uIFwiJHtwcm9wLm5hbWV9XCIgaW4gJHtmcW59IChhbHJlYWR5IGRlY2xhcmVkIGluICR7XG4gICAgICAgICAgICBvcHRpb25zW3Byb3AubmFtZV0ucGFyZW50XG4gICAgICAgICAgfSlgXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGxldCBqc2lpS2luZDtcbiAgICAgIGlmIChwcm9wLnR5cGU/LmZxbikge1xuICAgICAgICBqc2lpS2luZCA9IGpzaWlbcHJvcC50eXBlPy5mcW5dLmtpbmQ7IC8vIGUuZy4gJ2NsYXNzJywgJ2ludGVyZmFjZScsICdlbnVtJ1xuICAgICAgfVxuXG4gICAgICBjb25zdCBpc09wdGlvbmFsID0gb3B0aW9uYWwgfHwgcHJvcC5vcHRpb25hbDtcbiAgICAgIGNvbnN0IGRlZmF1bHRWYWx1ZSA9IHNhbml0aXplVmFsdWUocHJvcC5kb2NzPy5kZWZhdWx0KTtcbiAgICAgIGNvbnN0IHBqbmV3ID0gc2FuaXRpemVWYWx1ZShwcm9wLmRvY3M/LmN1c3RvbT8ucGpuZXcpO1xuXG4gICAgICAvLyBpZiB0aGlzIGlzIGEgbWFuZGF0b3J5IG9wdGlvbiBhbmQgd2UgaGF2ZSBhIGRlZmF1bHQgdmFsdWUsXG4gICAgICAvLyBvciB0aGUgb3B0aW9uIGlzIHRhZ2dlZCB0byBiZSByZW5kZXJlZCB3aXRoIGFuIGluaXRpYWwgdmFsdWUsXG4gICAgICAvLyB0aGUgdmFsdWUgaGFzIHRvIGJlIEpTT04tcGFyc2FibGUgdG8gdGhlIGNvcnJlY3QgdHlwZVxuICAgICAgY29uc3QgaW5pdGlhbFZhbHVlID0gZ2V0SW5pdGlhbFZhbHVlKGRlZmF1bHRWYWx1ZSwgcGpuZXcsIGlzT3B0aW9uYWwpO1xuICAgICAgaWYgKGluaXRpYWxWYWx1ZSkge1xuICAgICAgICBjaGVja0RlZmF1bHRJc1BhcnNhYmxlKHByb3AubmFtZSwgaW5pdGlhbFZhbHVlLCBwcm9wLnR5cGUpO1xuICAgICAgfVxuXG4gICAgICBvcHRpb25zW3Byb3AubmFtZV0gPSBmaWx0ZXJVbmRlZmluZWQoe1xuICAgICAgICBwYXRoOiBwcm9wUGF0aCxcbiAgICAgICAgcGFyZW50OiBzdHJ1Y3QubmFtZSxcbiAgICAgICAgbmFtZTogcHJvcC5uYW1lLFxuICAgICAgICBmcW46IHByb3AudHlwZT8uZnFuLFxuICAgICAgICBkb2NzOiBwcm9wLmRvY3Muc3VtbWFyeSxcbiAgICAgICAgc2ltcGxlVHlwZTogcHJvcC50eXBlID8gZ2V0U2ltcGxlVHlwZU5hbWUocHJvcC50eXBlKSA6IFwidW5rbm93blwiLFxuICAgICAgICBmdWxsVHlwZTogcHJvcC50eXBlLFxuICAgICAgICBraW5kOiBqc2lpS2luZCxcbiAgICAgICAganNvbkxpa2U6IHByb3AudHlwZSA/IGlzSnNvbkxpa2UoanNpaSwgcHJvcC50eXBlKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgc3dpdGNoOiBwcm9wUGF0aC5tYXAoKHApID0+IHNuYWtlKHApLnJlcGxhY2UoL18vZywgXCItXCIpKS5qb2luKFwiLVwiKSxcbiAgICAgICAgZGVmYXVsdDogZGVmYXVsdFZhbHVlLFxuICAgICAgICBpbml0aWFsVmFsdWU6IGluaXRpYWxWYWx1ZSxcbiAgICAgICAgb3B0aW9uYWw6IGlzT3B0aW9uYWwsXG4gICAgICAgIGZlYXR1cmVkOiBwcm9wLmRvY3M/LmN1c3RvbT8uZmVhdHVyZWQgPT09IFwidHJ1ZVwiLFxuICAgICAgICBkZXByZWNhdGVkOiBwcm9wLmRvY3Muc3RhYmlsaXR5ID09PSBcImRlcHJlY2F0ZWRcIiA/IHRydWUgOiB1bmRlZmluZWQsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGlmYyBvZiBzdHJ1Y3QuaW50ZXJmYWNlcyA/PyBbXSkge1xuICAgICAgYWRkT3B0aW9ucyhpZmMpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRJbml0aWFsVmFsdWUoXG4gIGRlZmF1bHRWYWx1ZT86IHN0cmluZyxcbiAgcGpuZXc/OiBzdHJpbmcsXG4gIGlzT3B0aW9uYWw6IGJvb2xlYW4gPSBmYWxzZVxuKSB7XG4gIGlmIChwam5ldykge1xuICAgIHJldHVybiBwam5ldztcbiAgfVxuXG4gIGlmICghaXNPcHRpb25hbCkge1xuICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBzYW5pdGl6ZVZhbHVlKHZhbD86IHN0cmluZykge1xuICBpZiAodmFsID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiB2YWw7XG59XG5cbmZ1bmN0aW9uIGdldFNpbXBsZVR5cGVOYW1lKHR5cGU6IEpzaWlQcm9wZXJ0eVR5cGUpOiBzdHJpbmcge1xuICBpZiAodHlwZT8ucHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHR5cGUucHJpbWl0aXZlOyAvLyBlLmcuICdzdHJpbmcnLCAnYm9vbGVhbicsICdudW1iZXInXG4gIH0gZWxzZSBpZiAodHlwZT8uZnFuKSB7XG4gICAgcmV0dXJuIHR5cGUuZnFuLnNwbGl0KFwiLlwiKS5wb3AoKSE7IC8vIHByb2plbi5Ob2RlUHJvamVjdE9wdGlvbnMgLT4gTm9kZVByb2plY3RPcHRpb25zXG4gIH0gZWxzZSB7XG4gICAgLy8gYW55IG90aGVyIHR5cGVzIHN1Y2ggYXMgY29sbGVjdGlvbiB0eXBlc1xuICAgIHJldHVybiBcInVua25vd25cIjtcbiAgfVxufVxuXG4vKipcbiAqIFdoZXRoZXIgYSB2YWx1ZSBvZiB0aGlzIHR5cGUgaXMgc2VyaWFsaXphYmxlIGludG8gSlNPTi5cbiAqL1xuZnVuY3Rpb24gaXNKc29uTGlrZShqc2lpOiBKc2lpVHlwZXMsIHR5cGU6IEpzaWlQcm9wZXJ0eVR5cGUpOiBib29sZWFuIHtcbiAgaWYgKHR5cGUucHJpbWl0aXZlKSB7XG4gICAgLy8gc3RyaW5nLCBib29sZWFuLCBudW1iZXIsIGFueVxuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2UgaWYgKHR5cGUuZnFuKSB7XG4gICAgY29uc3Qga2luZCA9IGpzaWlbdHlwZS5mcW5dLmtpbmQ7XG4gICAgaWYgKFtcImludGVyZmFjZVwiLCBcImVudW1cIl0uaW5jbHVkZXMoa2luZCkpIHtcbiAgICAgIC8vIG5vdCAnY2xhc3MnXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZS5jb2xsZWN0aW9uKSB7XG4gICAgcmV0dXJuIGlzSnNvbkxpa2UoanNpaSwgdHlwZS5jb2xsZWN0aW9uLmVsZW1lbnR0eXBlKTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGZpbHRlclVuZGVmaW5lZChvYmo6IGFueSkge1xuICBjb25zdCByZXQ6IGFueSA9IHt9O1xuICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhvYmopKSB7XG4gICAgaWYgKHYgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0W2tdID0gdjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gaXNQcm9qZWN0VHlwZShqc2lpOiBKc2lpVHlwZXMsIGZxbjogc3RyaW5nKSB7XG4gIGNvbnN0IHR5cGUgPSBqc2lpW2Zxbl07XG5cbiAgaWYgKCF0eXBlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYENvdWxkIG5vdCBmaW5kIHByb2plY3QgdHlwZSB3aXRoIGZxbiBcIiR7ZnFufVwiIGluICAuanNpaSBmaWxlLmBcbiAgICApO1xuICB9XG5cbiAgaWYgKHR5cGUua2luZCAhPT0gXCJjbGFzc1wiKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGlmICh0eXBlLmFic3RyYWN0KSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHR5cGUuZG9jcz8uZGVwcmVjYXRlZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGxldCBjdXJyID0gdHlwZTtcbiAgd2hpbGUgKHRydWUpIHtcbiAgICBpZiAoY3Vyci5mcW4gPT09IFBST0pFQ1RfQkFTRV9GUU4pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmICghY3Vyci5iYXNlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY3VyciA9IGpzaWlbY3Vyci5iYXNlXTtcbiAgICBpZiAoIWN1cnIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNQcmltaXRpdmVBcnJheSh7IGNvbGxlY3Rpb24gfTogSnNpaVByb3BlcnR5VHlwZSkge1xuICByZXR1cm4gQm9vbGVhbihcbiAgICBjb2xsZWN0aW9uPy5raW5kID09PSBcImFycmF5XCIgJiYgY29sbGVjdGlvbj8uZWxlbWVudHR5cGUucHJpbWl0aXZlXG4gICk7XG59XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlT3JQcmltaXRpdmVBcnJheSh0eXBlOiBKc2lpUHJvcGVydHlUeXBlKSB7XG4gIHJldHVybiBCb29sZWFuKHR5cGU/LnByaW1pdGl2ZSB8fCBpc1ByaW1pdGl2ZUFycmF5KHR5cGUpKTtcbn1cblxuZnVuY3Rpb24gY2hlY2tEZWZhdWx0SXNQYXJzYWJsZShcbiAgcHJvcDogc3RyaW5nLFxuICB2YWx1ZTogc3RyaW5nLFxuICB0eXBlPzogSnNpaVByb3BlcnR5VHlwZVxuKSB7XG4gIGlmICghKHR5cGUgJiYgaXNQcmltaXRpdmVPclByaW1pdGl2ZUFycmF5KHR5cGUpKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGByZXF1aXJlZCBvcHRpb24gXCIke3Byb3B9XCIgd2l0aCBhIEBkZWZhdWx0IG11c3QgdXNlIHByaW1pdGl2ZSB0eXBlcyAoc3RyaW5nLCBudW1iZXIgYW5kIGJvb2xlYW4pIG9yIGEgcHJpbWl0aXZlIGFycmF5LiB0eXBlIGZvdW5kIGlzOiAke0pTT04uc3RyaW5naWZ5KFxuICAgICAgICB0eXBlXG4gICAgICApfWBcbiAgICApO1xuICB9XG5cbiAgLy8gbWFjcm9zIGFyZSBwYXNzLXRocm91Z2hcbiAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoXCIkXCIpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHZhbHVlKTtcblxuICAgIC8vIFByaW1pdGl2ZSB0eXBlXG4gICAgaWYgKHR5cGVvZiBwYXJzZWQgPT09IHR5cGUucHJpbWl0aXZlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUHJpbWl0aXZlIGFycmF5XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocGFyc2VkKSAmJiBpc1ByaW1pdGl2ZUFycmF5KHR5cGUpKSB7XG4gICAgICAvLyBidXQgZW1wdHkgKHdoaWNoIGlzIG9rYXkpXG4gICAgICBpZiAocGFyc2VkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIGlmIGZpcnN0IGVsZW1lbnQgbWF0Y2hlcyB0aGUgdHlwZSwgYXNzdW1lIGl0J3MgY29ycmVjdFxuICAgICAgaWYgKHR5cGVvZiBwYXJzZWRbMF0gPT09IHR5cGU/LmNvbGxlY3Rpb24/LmVsZW1lbnR0eXBlLnByaW1pdGl2ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUGFyc2VkIHZhbHVlIGRvZXMgbm90IG1hdGNoIHR5cGVcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgY2Fubm90IHBhcnNlIEBkZWZhdWx0IHZhbHVlIGZvciBtYW5kYXRvcnkgb3B0aW9uICR7cHJvcH0gYXMgYSAke3R5cGV9OiAke3BhcnNlZH1gXG4gICAgKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGB1bmFibGUgdG8gSlNPTi5wYXJzZSgpIHZhbHVlIFwiJHt2YWx1ZX1cIiBzcGVjaWZpZWQgYXMgQGRlZmF1bHQgZm9yIG1hbmRhdG9yeSBvcHRpb24gXCIke3Byb3B9XCI6ICR7XG4gICAgICAgIChlIGFzIGFueSkubWVzc2FnZVxuICAgICAgfWBcbiAgICApO1xuICB9XG59XG4iXX0=