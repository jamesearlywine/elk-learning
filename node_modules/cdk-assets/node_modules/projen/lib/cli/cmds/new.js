"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const semver = require("semver");
const yargs = require("yargs");
const inventory = require("../../inventory");
const logging = require("../../logging");
const option_hints_1 = require("../../option-hints");
const projects_1 = require("../../projects");
const util_1 = require("../../util");
const macros_1 = require("../macros");
const util_2 = require("../util");
class Command {
    constructor() {
        this.command = "new [PROJECT-TYPE-NAME] [OPTIONS]";
        this.describe = [
            "Creates a new projen project",
            "",
            "For a complete list of the available options for a specific project type, run:",
            "projen new [PROJECT-TYPE-NAME] --help",
        ].join("\n");
    }
    builder(args) {
        args.positional("PROJECT-TYPE-NAME", {
            describe: "only optional with --from and the external module has only a single project type",
            type: "string",
        });
        args.option("synth", {
            type: "boolean",
            default: true,
            desc: "Synthesize after creating .projenrc.js",
        });
        args.option("comments", {
            type: "boolean",
            default: true,
            desc: "Include commented out options in .projenrc.js (use --no-comments to disable)",
        });
        args.option("from", {
            type: "string",
            alias: "f",
            desc: 'External jsii npm module to create project from. Supports any package spec supported by npm (such as "my-pack@^2.0")',
        });
        args.option("git", {
            type: "boolean",
            default: true,
            desc: "Run `git init` and create an initial commit (use --no-git to disable)",
        });
        args.example("projen new awscdk-app-ts", 'Creates a new project of built-in type "awscdk-app-ts"');
        args.example("projen new --from projen-vue@^2", 'Creates a new project from an external module "projen-vue" with the specified version');
        args.example("projen new python --help", 'Shows all options available for the built-in project type "python"');
        for (const type of inventory.discover()) {
            args.command(type.pjid, type.docs ?? "", {
                builder: (cargs) => {
                    cargs.showHelpOnFail(false);
                    for (const option of type.options ?? []) {
                        // not all types can be represented in the cli
                        if (!argTypeSupported(option)) {
                            continue;
                        }
                        const defaultValue = argInitialValue(option);
                        cargs.option(option.switch, {
                            group: !option.optional ? "Required:" : "Optional:",
                            type: argType(option),
                            description: argDesc(option),
                            required: !option.optional,
                            // yargs behaves differently for arrays if the defaultValue property is present or not
                            ...(!option.optional && defaultValue
                                ? { default: defaultValue }
                                : {}),
                        });
                    }
                    return cargs;
                },
                handler: (argv) => initProject(process.cwd(), type, argv),
            });
        }
        // Disable strict mode, otherwise the catch-all doesn't work
        args.strictCommands(false);
        args
            .command({
            command: "*",
            describe: false,
            handler,
        })
            .middleware((argv) => {
            // manually set the matched command as the project type
            argv.projectTypeName = argv._[1];
        }, true);
        return args;
    }
    async handler(args) {
        return handler(args);
    }
}
async function handler(args) {
    try {
        // handle --from which means we want to first install a jsii module and then
        // create a project defined within this module.
        if (args.from) {
            args.from = (0, util_1.normalizePersistedPath)(args.from);
            return await initProjectFromModule(process.cwd(), args.from, args);
        }
        // project type is defined but was not matched by yargs, so print the list of supported types
        if (args.projectTypeName) {
            const types = inventory.discover();
            throw new util_2.CliError(`Project type "${args.projectTypeName}" not found. Available types:\n`, ...types.map((t) => `    ${t.pjid}`), "", `Please specify a project type.`, `Example: npx projen new ${types[0].pjid}`);
        }
        // Handles the use case that nothing was specified since PROJECT-TYPE is now an optional positional parameter
        yargs.showHelp();
    }
    catch (error) {
        if (error instanceof util_2.CliError) {
            logging.error(error.message);
            logging.empty();
            process.exitCode = 1;
            return;
        }
        // unknown error, likely a node runtime exception in project code
        // rethrow so the full stack trace is displayed
        throw error;
    }
}
/**
 * Returns the yargs option type for a given project option
 */
function argType(option) {
    if (option.kind === "enum") {
        return "string";
    }
    if (isPrimitiveArrayOption(option)) {
        return "array";
    }
    return option.simpleType;
}
/**
 * Returns the description for a given project option
 */
function argDesc(option) {
    let desc = [option.docs?.replace(/\ *\.$/, "") ?? ""];
    const helpDefault = option.initialValue ?? option.default;
    if (option.optional && helpDefault) {
        desc.push(`[default: ${helpDefault.replace(/^\ *-/, "").replace(/\.$/, "").trim()}]`);
    }
    return desc.join(" ");
}
/**
 * Compute the initial value for a given project option
 */
function argInitialValue(option, cwd = process.cwd()) {
    // if we have determined an initial value for the field
    // we can show that value in --help
    if (option.initialValue) {
        return renderDefault(cwd, option.initialValue);
    }
}
/**
 * Currently we only support these field types as command line options:
 * - primitives (string, number, boolean)
 * - lists of primitives
 * - enums
 */
function argTypeSupported(option) {
    return (option.simpleType === "string" ||
        option.simpleType === "number" ||
        option.simpleType === "boolean" ||
        option.kind === "enum" ||
        isPrimitiveArrayOption(option));
}
/**
 * Checks if the given option is a primitive array
 */
function isPrimitiveArrayOption(option) {
    return Boolean(option.jsonLike &&
        option.fullType.collection?.kind === "array" &&
        option.fullType.collection.elementtype.primitive &&
        ["string", "number"].includes(option.fullType.collection.elementtype.primitive));
}
/**
 * Given a value from "@default", processes macros and returns a stringified
 * (quoted) result.
 *
 * @returns a javascript primitive (could be a string, number or boolean)
 */
function renderDefault(cwd, value) {
    return (0, macros_1.tryProcessMacro)(cwd, value) ?? JSON.parse(value);
}
/**
 * Converts yargs command line switches to project type props.
 * @param type Project type
 * @param argv Command line switches
 */
function commandLineToProps(cwd, type, argv) {
    const props = {};
    // initialize props with default values
    for (const prop of type.options) {
        props[prop.name] = argInitialValue(prop, cwd);
    }
    for (const [arg, value] of Object.entries(argv)) {
        for (const prop of type.options) {
            if (prop.switch === arg) {
                let curr = props;
                const queue = [...prop.path];
                while (true) {
                    const p = queue.shift();
                    if (!p) {
                        break;
                    }
                    if (queue.length === 0) {
                        curr[p] = value;
                    }
                    else {
                        curr[p] = curr[p] ?? {};
                        curr = curr[p];
                    }
                }
            }
        }
    }
    return props;
}
/**
 * Generates a new project from an external module.
 *
 * @param spec The name of the external module to load
 * @param args Command line arguments (incl. project type)
 */
async function initProjectFromModule(baseDir, spec, args) {
    const projenVersion = args.projenVersion ?? "latest";
    const installCommand = (0, util_2.renderInstallCommand)(baseDir, `projen@${projenVersion}`);
    if (args.projenVersion) {
        (0, util_1.exec)(installCommand, { cwd: baseDir });
    }
    else {
        // do not overwrite existing installation
        (0, util_1.exec)(`npm ls --prefix="${baseDir}" --depth=0 --pattern projen || ${installCommand}`, { cwd: baseDir });
    }
    const installPackageWithCliError = (b, s) => {
        try {
            return (0, util_2.installPackage)(b, s);
        }
        catch (error) {
            const stderr = error?.stderr?.toString() ?? "";
            const isLocal = stderr.includes("code ENOENT");
            const isRegistry = stderr.includes("code E404");
            if (isLocal || isRegistry) {
                const moduleSource = isLocal ? "path" : "registry";
                throw new util_2.CliError(`Could not find '${s}' in this ${moduleSource}. Please ensure that the package exists, you have access it and try again.`);
            }
            throw error;
        }
    };
    const moduleName = installPackageWithCliError(baseDir, spec);
    logging.empty();
    // Find the just installed package and discover the rest recursively from this package folder
    const moduleDir = (0, util_2.findJsiiFilePath)(baseDir, moduleName);
    if (!moduleDir) {
        throw new util_2.CliError(`Module '${moduleName}' does not look like it is compatible with projen. Reason: Cannot find '${moduleName}/.jsii'. All projen modules must be jsii modules!`);
    }
    // Only leave projects from the main (requested) package
    const projects = inventory
        .discover(moduleDir)
        .filter((x) => x.moduleName === moduleName); // Only list project types from the requested 'from' module
    if (projects.length < 1) {
        throw new util_2.CliError(`No project types found after installing "${spec}". The module must export at least one class which extends "projen.Project".`);
    }
    const requested = args.projectTypeName;
    const types = projects.map((p) => p.pjid);
    // if user did not specify a project type but the module has more than one, we need them to tell us which one...
    if (!requested && projects.length > 1) {
        throw new util_2.CliError(`Multiple project types found after installing "${spec}":\n`, ...types.map((t) => `    ${t}`), "", `Please specify a project type.`, `Example: npx projen new --from ${spec} ${types[0]}`);
    }
    // if user did not specify a type (and we know we have only one), the select it. otherwise, search by pjid.
    const type = !requested
        ? projects[0]
        : projects.find((p) => p.pjid === requested);
    if (!type) {
        throw new util_2.CliError(`Project type "${requested}" not found in "${spec}". Found:\n`, ...types.map((t) => `    ${t}`), "", `Please specify a valid project type.`, `Example: npx projen new --from ${spec} ${types[0]}`);
    }
    const missingOptions = [];
    for (const option of type.options ?? []) {
        // not all types can be represented in the cli
        if (!argTypeSupported(option)) {
            continue;
        }
        // parse allowed types
        if (args[option.name] !== undefined) {
            args[option.name] = parseArg(args[option.name], argType(option), option);
            args[option.switch] = args[option.name];
            continue;
        }
        // Required option with a default
        if (!option.optional && option.default && option.default !== "undefined") {
            const defaultValue = renderDefault(baseDir, option.default);
            args[option.name] = defaultValue;
            args[option.switch] = defaultValue;
        }
        // Required option, but we could not find a value
        if (!option.optional && !args[option.name]) {
            missingOptions.push(`--${option.switch} [${argType(option)}] ${argDesc(option)}`);
        }
    }
    // We are missing some required options
    if (missingOptions.length) {
        throw new util_2.CliError(`Cannot create "${type.fqn}". Missing required option${missingOptions.length > 1 ? "s" : ""}:`, ...missingOptions.map((m) => `    ${m}`));
    }
    // include a dev dependency for the external module
    args.devDeps = [spec];
    args["dev-deps"] = [spec];
    await initProject(baseDir, type, args);
}
/**
 * Parse command line value as option type
 */
function parseArg(value, type, option) {
    switch (type) {
        case "number":
            return parseInt(value);
        case "boolean":
            return typeof value === "string" ? (0, util_1.isTruthy)(value) : value;
        case "array":
            if (!Array.isArray(value)) {
                value = [value];
            }
            return value.map((v) => parseArg(v, option?.fullType.collection?.elementtype.primitive || "string"));
        // return value unchanged
        case "string":
        default:
            // if we have an unexpected array, use the first element
            if (Array.isArray(value)) {
                return value[0];
            }
            return value;
    }
}
/**
 * Generates a new project.
 * @param type Project type
 * @param args Command line arguments
 * @param additionalProps Additional parameters to include in .projenrc.js
 */
async function initProject(baseDir, type, args) {
    // convert command line arguments to project props using type information
    const props = commandLineToProps(baseDir, type, args);
    projects_1.Projects.createProject({
        dir: props.outdir ?? baseDir,
        projectFqn: type.fqn,
        projectOptions: props,
        optionHints: args.comments
            ? option_hints_1.InitProjectOptionHints.FEATURED
            : option_hints_1.InitProjectOptionHints.NONE,
        synth: args.synth,
        post: args.post,
    });
    if (fs.existsSync(path.join(baseDir, "package.json")) && args.post) {
        (0, util_1.exec)("npm run eslint --if-present", { cwd: baseDir });
    }
    if (args.git) {
        const git = (cmd) => (0, util_1.exec)(`git ${cmd}`, { cwd: baseDir });
        const gitversion = (0, util_1.getGitVersion)((0, util_1.execCapture)("git --version", { cwd: baseDir }).toString());
        logging.debug("system using git version ", gitversion);
        // `git config init.defaultBranch` and `git init -b` are only available since git 2.28.0
        if (gitversion && semver.gte(gitversion, "2.28.0")) {
            const defaultGitInitBranch = (0, util_1.execOrUndefined)("git config init.defaultBranch", {
                cwd: baseDir,
            })?.trim() || "main";
            git(`init -b ${defaultGitInitBranch}`);
            git("add .");
            git('commit --allow-empty -m "chore: project created with projen"');
            logging.debug(`default branch name set to ${defaultGitInitBranch}`);
        }
        else {
            git("init");
            git("add .");
            git('commit --allow-empty -m "chore: project created with projen"');
            logging.debug("older version of git detected, changed default branch name to main");
            git("branch -M main");
        }
    }
}
exports.default = new Command();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaS9jbWRzL25ldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0IsaUNBQWlDO0FBQ2pDLCtCQUErQjtBQUMvQiw2Q0FBNkM7QUFDN0MseUNBQXlDO0FBQ3pDLHFEQUE0RDtBQUM1RCw2Q0FBMEM7QUFDMUMscUNBT29CO0FBQ3BCLHNDQUE0QztBQUM1QyxrQ0FLaUI7QUFFakIsTUFBTSxPQUFPO0lBQWI7UUFDa0IsWUFBTyxHQUFHLG1DQUFtQyxDQUFDO1FBQzlDLGFBQVEsR0FBRztZQUN6Qiw4QkFBOEI7WUFDOUIsRUFBRTtZQUNGLGdGQUFnRjtZQUNoRix1Q0FBdUM7U0FDeEMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUEwRmYsQ0FBQztJQXhGUSxPQUFPLENBQUMsSUFBZ0I7UUFDN0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRTtZQUNuQyxRQUFRLEVBQ04sa0ZBQWtGO1lBQ3BGLElBQUksRUFBRSxRQUFRO1NBQ2YsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDbkIsSUFBSSxFQUFFLFNBQVM7WUFDZixPQUFPLEVBQUUsSUFBSTtZQUNiLElBQUksRUFBRSx3Q0FBd0M7U0FDL0MsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUU7WUFDdEIsSUFBSSxFQUFFLFNBQVM7WUFDZixPQUFPLEVBQUUsSUFBSTtZQUNiLElBQUksRUFBRSw4RUFBOEU7U0FDckYsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDbEIsSUFBSSxFQUFFLFFBQVE7WUFDZCxLQUFLLEVBQUUsR0FBRztZQUNWLElBQUksRUFBRSxzSEFBc0g7U0FDN0gsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FB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QThCLG9CQUFvQixFQUFFLENBQUMsQ0FBQztRQUN0RSxDQUFDO2FBQU0sQ0FBQztZQUNOLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNaLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNiLEdBQUcsQ0FBQyw4REFBOEQsQ0FBQyxDQUFDO1lBQ3BFLE9BQU8sQ0FBQyxLQUFLLENBQ1gsb0VBQW9FLENBQ3JFLENBQUM7WUFDRixHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN4QixDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUM7QUFFRCxrQkFBZSxJQUFJLE9BQU8sRUFBRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBTcGF3blN5bmNSZXR1cm5zIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gXCJzZW12ZXJcIjtcbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gXCJ5YXJnc1wiO1xuaW1wb3J0ICogYXMgaW52ZW50b3J5IGZyb20gXCIuLi8uLi9pbnZlbnRvcnlcIjtcbmltcG9ydCAqIGFzIGxvZ2dpbmcgZnJvbSBcIi4uLy4uL2xvZ2dpbmdcIjtcbmltcG9ydCB7IEluaXRQcm9qZWN0T3B0aW9uSGludHMgfSBmcm9tIFwiLi4vLi4vb3B0aW9uLWhpbnRzXCI7XG5pbXBvcnQgeyBQcm9qZWN0cyB9IGZyb20gXCIuLi8uLi9wcm9qZWN0c1wiO1xuaW1wb3J0IHtcbiAgZXhlYyxcbiAgZXhlY0NhcHR1cmUsXG4gIGV4ZWNPclVuZGVmaW5lZCxcbiAgZ2V0R2l0VmVyc2lvbixcbiAgaXNUcnV0aHksXG4gIG5vcm1hbGl6ZVBlcnNpc3RlZFBhdGgsXG59IGZyb20gXCIuLi8uLi91dGlsXCI7XG5pbXBvcnQgeyB0cnlQcm9jZXNzTWFjcm8gfSBmcm9tIFwiLi4vbWFjcm9zXCI7XG5pbXBvcnQge1xuICBDbGlFcnJvcixcbiAgZmluZEpzaWlGaWxlUGF0aCxcbiAgaW5zdGFsbFBhY2thZ2UsXG4gIHJlbmRlckluc3RhbGxDb21tYW5kLFxufSBmcm9tIFwiLi4vdXRpbFwiO1xuXG5jbGFzcyBDb21tYW5kIGltcGxlbWVudHMgeWFyZ3MuQ29tbWFuZE1vZHVsZSB7XG4gIHB1YmxpYyByZWFkb25seSBjb21tYW5kID0gXCJuZXcgW1BST0pFQ1QtVFlQRS1OQU1FXSBbT1BUSU9OU11cIjtcbiAgcHVibGljIHJlYWRvbmx5IGRlc2NyaWJlID0gW1xuICAgIFwiQ3JlYXRlcyBhIG5ldyBwcm9qZW4gcHJvamVjdFwiLFxuICAgIFwiXCIsXG4gICAgXCJGb3IgYSBjb21wbGV0ZSBsaXN0IG9mIHRoZSBhdmFpbGFibGUgb3B0aW9ucyBmb3IgYSBzcGVjaWZpYyBwcm9qZWN0IHR5cGUsIHJ1bjpcIixcbiAgICBcInByb2plbiBuZXcgW1BST0pFQ1QtVFlQRS1OQU1FXSAtLWhlbHBcIixcbiAgXS5qb2luKFwiXFxuXCIpO1xuXG4gIHB1YmxpYyBidWlsZGVyKGFyZ3M6IHlhcmdzLkFyZ3YpIHtcbiAgICBhcmdzLnBvc2l0aW9uYWwoXCJQUk9KRUNULVRZUEUtTkFNRVwiLCB7XG4gICAgICBkZXNjcmliZTpcbiAgICAgICAgXCJvbmx5IG9wdGlvbmFsIHdpdGggLS1mcm9tIGFuZCB0aGUgZXh0ZXJuYWwgbW9kdWxlIGhhcyBvbmx5IGEgc2luZ2xlIHByb2plY3QgdHlwZVwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICB9KTtcbiAgICBhcmdzLm9wdGlvbihcInN5bnRoXCIsIHtcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2M6IFwiU3ludGhlc2l6ZSBhZnRlciBjcmVhdGluZyAucHJvamVucmMuanNcIixcbiAgICB9KTtcbiAgICBhcmdzLm9wdGlvbihcImNvbW1lbnRzXCIsIHtcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2M6IFwiSW5jbHVkZSBjb21tZW50ZWQgb3V0IG9wdGlvbnMgaW4gLnByb2plbnJjLmpzICh1c2UgLS1uby1jb21tZW50cyB0byBkaXNhYmxlKVwiLFxuICAgIH0pO1xuICAgIGFyZ3Mub3B0aW9uKFwiZnJvbVwiLCB7XG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgYWxpYXM6IFwiZlwiLFxuICAgICAgZGVzYzogJ0V4dGVybmFsIGpzaWkgbnBtIG1vZHVsZSB0byBjcmVhdGUgcHJvamVjdCBmcm9tLiBTdXBwb3J0cyBhbnkgcGFja2FnZSBzcGVjIHN1cHBvcnRlZCBieSBucG0gKHN1Y2ggYXMgXCJteS1wYWNrQF4yLjBcIiknLFxuICAgIH0pO1xuICAgIGFyZ3Mub3B0aW9uKFwiZ2l0XCIsIHtcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2M6IFwiUnVuIGBnaXQgaW5pdGAgYW5kIGNyZWF0ZSBhbiBpbml0aWFsIGNvbW1pdCAodXNlIC0tbm8tZ2l0IHRvIGRpc2FibGUpXCIsXG4gICAgfSk7XG4gICAgYXJncy5leGFtcGxlKFxuICAgICAgXCJwcm9qZW4gbmV3IGF3c2Nkay1hcHAtdHNcIixcbiAgICAgICdDcmVhdGVzIGEgbmV3IHByb2plY3Qgb2YgYnVpbHQtaW4gdHlwZSBcImF3c2Nkay1hcHAtdHNcIidcbiAgICApO1xuICAgIGFyZ3MuZXhhbXBsZShcbiAgICAgIFwicHJvamVuIG5ldyAtLWZyb20gcHJvamVuLXZ1ZUBeMlwiLFxuICAgICAgJ0NyZWF0ZXMgYSBuZXcgcHJvamVjdCBmcm9tIGFuIGV4dGVybmFsIG1vZHVsZSBcInByb2plbi12dWVcIiB3aXRoIHRoZSBzcGVjaWZpZWQgdmVyc2lvbidcbiAgICApO1xuICAgIGFyZ3MuZXhhbXBsZShcbiAgICAgIFwicHJvamVuIG5ldyBweXRob24gLS1oZWxwXCIsXG4gICAgICAnU2hvd3MgYWxsIG9wdGlvbnMgYXZhaWxhYmxlIGZvciB0aGUgYnVpbHQtaW4gcHJvamVjdCB0eXBlIFwicHl0aG9uXCInXG4gICAgKTtcblxuICAgIGZvciAoY29uc3QgdHlwZSBvZiBpbnZlbnRvcnkuZGlzY292ZXIoKSkge1xuICAgICAgYXJncy5jb21tYW5kKHR5cGUucGppZCwgdHlwZS5kb2NzID8/IFwiXCIsIHtcbiAgICAgICAgYnVpbGRlcjogKGNhcmdzKSA9PiB7XG4gICAgICAgICAgY2FyZ3Muc2hvd0hlbHBPbkZhaWwoZmFsc2UpO1xuXG4gICAgICAgICAgZm9yIChjb25zdCBvcHRpb24gb2YgdHlwZS5vcHRpb25zID8/IFtdKSB7XG4gICAgICAgICAgICAvLyBub3QgYWxsIHR5cGVzIGNhbiBiZSByZXByZXNlbnRlZCBpbiB0aGUgY2xpXG4gICAgICAgICAgICBpZiAoIWFyZ1R5cGVTdXBwb3J0ZWQob3B0aW9uKSkge1xuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgZGVmYXVsdFZhbHVlID0gYXJnSW5pdGlhbFZhbHVlKG9wdGlvbik7XG4gICAgICAgICAgICBjYXJncy5vcHRpb24ob3B0aW9uLnN3aXRjaCwge1xuICAgICAgICAgICAgICBncm91cDogIW9wdGlvbi5vcHRpb25hbCA/IFwiUmVxdWlyZWQ6XCIgOiBcIk9wdGlvbmFsOlwiLFxuICAgICAgICAgICAgICB0eXBlOiBhcmdUeXBlKG9wdGlvbiksXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBhcmdEZXNjKG9wdGlvbiksXG4gICAgICAgICAgICAgIHJlcXVpcmVkOiAhb3B0aW9uLm9wdGlvbmFsLFxuICAgICAgICAgICAgICAvLyB5YXJncyBiZWhhdmVzIGRpZmZlcmVudGx5IGZvciBhcnJheXMgaWYgdGhlIGRlZmF1bHRWYWx1ZSBwcm9wZXJ0eSBpcyBwcmVzZW50IG9yIG5vdFxuICAgICAgICAgICAgICAuLi4oIW9wdGlvbi5vcHRpb25hbCAmJiBkZWZhdWx0VmFsdWVcbiAgICAgICAgICAgICAgICA/IHsgZGVmYXVsdDogZGVmYXVsdFZhbHVlIH1cbiAgICAgICAgICAgICAgICA6IHt9KSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBjYXJncztcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlcjogKGFyZ3YpID0+IGluaXRQcm9qZWN0KHByb2Nlc3MuY3dkKCksIHR5cGUsIGFyZ3YpLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gRGlzYWJsZSBzdHJpY3QgbW9kZSwgb3RoZXJ3aXNlIHRoZSBjYXRjaC1hbGwgZG9lc24ndCB3b3JrXG4gICAgYXJncy5zdHJpY3RDb21tYW5kcyhmYWxzZSk7XG4gICAgYXJnc1xuICAgICAgLmNvbW1hbmQoe1xuICAgICAgICBjb21tYW5kOiBcIipcIixcbiAgICAgICAgZGVzY3JpYmU6IGZhbHNlLFxuICAgICAgICBoYW5kbGVyLFxuICAgICAgfSlcbiAgICAgIC5taWRkbGV3YXJlKChhcmd2KSA9PiB7XG4gICAgICAgIC8vIG1hbnVhbGx5IHNldCB0aGUgbWF0Y2hlZCBjb21tYW5kIGFzIHRoZSBwcm9qZWN0IHR5cGVcbiAgICAgICAgYXJndi5wcm9qZWN0VHlwZU5hbWUgPSBhcmd2Ll9bMV07XG4gICAgICB9LCB0cnVlKTtcblxuICAgIHJldHVybiBhcmdzO1xuICB9XG5cbiAgcHVibGljIGFzeW5jIGhhbmRsZXIoYXJnczogYW55KSB7XG4gICAgcmV0dXJuIGhhbmRsZXIoYXJncyk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihhcmdzOiBhbnkpIHtcbiAgdHJ5IHtcbiAgICAvLyBoYW5kbGUgLS1mcm9tIHdoaWNoIG1lYW5zIHdlIHdhbnQgdG8gZmlyc3QgaW5zdGFsbCBhIGpzaWkgbW9kdWxlIGFuZCB0aGVuXG4gICAgLy8gY3JlYXRlIGEgcHJvamVjdCBkZWZpbmVkIHdpdGhpbiB0aGlzIG1vZHVsZS5cbiAgICBpZiAoYXJncy5mcm9tKSB7XG4gICAgICBhcmdzLmZyb20gPSBub3JtYWxpemVQZXJzaXN0ZWRQYXRoKGFyZ3MuZnJvbSk7XG5cbiAgICAgIHJldHVybiBhd2FpdCBpbml0UHJvamVjdEZyb21Nb2R1bGUocHJvY2Vzcy5jd2QoKSwgYXJncy5mcm9tLCBhcmdzKTtcbiAgICB9XG5cbiAgICAvLyBwcm9qZWN0IHR5cGUgaXMgZGVmaW5lZCBidXQgd2FzIG5vdCBtYXRjaGVkIGJ5IHlhcmdzLCBzbyBwcmludCB0aGUgbGlzdCBvZiBzdXBwb3J0ZWQgdHlwZXNcbiAgICBpZiAoYXJncy5wcm9qZWN0VHlwZU5hbWUpIHtcbiAgICAgIGNvbnN0IHR5cGVzID0gaW52ZW50b3J5LmRpc2NvdmVyKCk7XG4gICAgICB0aHJvdyBuZXcgQ2xpRXJyb3IoXG4gICAgICAgIGBQcm9qZWN0IHR5cGUgXCIke2FyZ3MucHJvamVjdFR5cGVOYW1lfVwiIG5vdCBmb3VuZC4gQXZhaWxhYmxlIHR5cGVzOlxcbmAsXG4gICAgICAgIC4uLnR5cGVzLm1hcCgodCkgPT4gYCAgICAke3QucGppZH1gKSxcbiAgICAgICAgXCJcIixcbiAgICAgICAgYFBsZWFzZSBzcGVjaWZ5IGEgcHJvamVjdCB0eXBlLmAsXG4gICAgICAgIGBFeGFtcGxlOiBucHggcHJvamVuIG5ldyAke3R5cGVzWzBdLnBqaWR9YFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGVzIHRoZSB1c2UgY2FzZSB0aGF0IG5vdGhpbmcgd2FzIHNwZWNpZmllZCBzaW5jZSBQUk9KRUNULVRZUEUgaXMgbm93IGFuIG9wdGlvbmFsIHBvc2l0aW9uYWwgcGFyYW1ldGVyXG4gICAgeWFyZ3Muc2hvd0hlbHAoKTtcbiAgfSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBDbGlFcnJvcikge1xuICAgICAgbG9nZ2luZy5lcnJvcihlcnJvci5tZXNzYWdlKTtcbiAgICAgIGxvZ2dpbmcuZW1wdHkoKTtcbiAgICAgIHByb2Nlc3MuZXhpdENvZGUgPSAxO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHVua25vd24gZXJyb3IsIGxpa2VseSBhIG5vZGUgcnVudGltZSBleGNlcHRpb24gaW4gcHJvamVjdCBjb2RlXG4gICAgLy8gcmV0aHJvdyBzbyB0aGUgZnVsbCBzdGFjayB0cmFjZSBpcyBkaXNwbGF5ZWRcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHlhcmdzIG9wdGlvbiB0eXBlIGZvciBhIGdpdmVuIHByb2plY3Qgb3B0aW9uXG4gKi9cbmZ1bmN0aW9uIGFyZ1R5cGUoXG4gIG9wdGlvbjogaW52ZW50b3J5LlByb2plY3RPcHRpb25cbik6IFwic3RyaW5nXCIgfCBcImJvb2xlYW5cIiB8IFwibnVtYmVyXCIgfCBcImFycmF5XCIge1xuICBpZiAob3B0aW9uLmtpbmQgPT09IFwiZW51bVwiKSB7XG4gICAgcmV0dXJuIFwic3RyaW5nXCI7XG4gIH1cblxuICBpZiAoaXNQcmltaXRpdmVBcnJheU9wdGlvbihvcHRpb24pKSB7XG4gICAgcmV0dXJuIFwiYXJyYXlcIjtcbiAgfVxuXG4gIHJldHVybiBvcHRpb24uc2ltcGxlVHlwZSBhcyBcInN0cmluZ1wiIHwgXCJib29sZWFuXCIgfCBcIm51bWJlclwiO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGRlc2NyaXB0aW9uIGZvciBhIGdpdmVuIHByb2plY3Qgb3B0aW9uXG4gKi9cbmZ1bmN0aW9uIGFyZ0Rlc2Mob3B0aW9uOiBpbnZlbnRvcnkuUHJvamVjdE9wdGlvbik6IHN0cmluZyB7XG4gIGxldCBkZXNjID0gW29wdGlvbi5kb2NzPy5yZXBsYWNlKC9cXCAqXFwuJC8sIFwiXCIpID8/IFwiXCJdO1xuXG4gIGNvbnN0IGhlbHBEZWZhdWx0ID0gb3B0aW9uLmluaXRpYWxWYWx1ZSA/PyBvcHRpb24uZGVmYXVsdDtcbiAgaWYgKG9wdGlvbi5vcHRpb25hbCAmJiBoZWxwRGVmYXVsdCkge1xuICAgIGRlc2MucHVzaChcbiAgICAgIGBbZGVmYXVsdDogJHtoZWxwRGVmYXVsdC5yZXBsYWNlKC9eXFwgKi0vLCBcIlwiKS5yZXBsYWNlKC9cXC4kLywgXCJcIikudHJpbSgpfV1gXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBkZXNjLmpvaW4oXCIgXCIpO1xufVxuXG4vKipcbiAqIENvbXB1dGUgdGhlIGluaXRpYWwgdmFsdWUgZm9yIGEgZ2l2ZW4gcHJvamVjdCBvcHRpb25cbiAqL1xuZnVuY3Rpb24gYXJnSW5pdGlhbFZhbHVlKFxuICBvcHRpb246IGludmVudG9yeS5Qcm9qZWN0T3B0aW9uLFxuICBjd2QgPSBwcm9jZXNzLmN3ZCgpXG4pOiBhbnkge1xuICAvLyBpZiB3ZSBoYXZlIGRldGVybWluZWQgYW4gaW5pdGlhbCB2YWx1ZSBmb3IgdGhlIGZpZWxkXG4gIC8vIHdlIGNhbiBzaG93IHRoYXQgdmFsdWUgaW4gLS1oZWxwXG4gIGlmIChvcHRpb24uaW5pdGlhbFZhbHVlKSB7XG4gICAgcmV0dXJuIHJlbmRlckRlZmF1bHQoY3dkLCBvcHRpb24uaW5pdGlhbFZhbHVlKTtcbiAgfVxufVxuXG4vKipcbiAqIEN1cnJlbnRseSB3ZSBvbmx5IHN1cHBvcnQgdGhlc2UgZmllbGQgdHlwZXMgYXMgY29tbWFuZCBsaW5lIG9wdGlvbnM6XG4gKiAtIHByaW1pdGl2ZXMgKHN0cmluZywgbnVtYmVyLCBib29sZWFuKVxuICogLSBsaXN0cyBvZiBwcmltaXRpdmVzXG4gKiAtIGVudW1zXG4gKi9cbmZ1bmN0aW9uIGFyZ1R5cGVTdXBwb3J0ZWQob3B0aW9uOiBpbnZlbnRvcnkuUHJvamVjdE9wdGlvbik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIG9wdGlvbi5zaW1wbGVUeXBlID09PSBcInN0cmluZ1wiIHx8XG4gICAgb3B0aW9uLnNpbXBsZVR5cGUgPT09IFwibnVtYmVyXCIgfHxcbiAgICBvcHRpb24uc2ltcGxlVHlwZSA9PT0gXCJib29sZWFuXCIgfHxcbiAgICBvcHRpb24ua2luZCA9PT0gXCJlbnVtXCIgfHxcbiAgICBpc1ByaW1pdGl2ZUFycmF5T3B0aW9uKG9wdGlvbilcbiAgKTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGdpdmVuIG9wdGlvbiBpcyBhIHByaW1pdGl2ZSBhcnJheVxuICovXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZUFycmF5T3B0aW9uKG9wdGlvbjogaW52ZW50b3J5LlByb2plY3RPcHRpb24pOiBib29sZWFuIHtcbiAgcmV0dXJuIEJvb2xlYW4oXG4gICAgb3B0aW9uLmpzb25MaWtlICYmXG4gICAgICBvcHRpb24uZnVsbFR5cGUuY29sbGVjdGlvbj8ua2luZCA9PT0gXCJhcnJheVwiICYmXG4gICAgICBvcHRpb24uZnVsbFR5cGUuY29sbGVjdGlvbi5lbGVtZW50dHlwZS5wcmltaXRpdmUgJiZcbiAgICAgIFtcInN0cmluZ1wiLCBcIm51bWJlclwiXS5pbmNsdWRlcyhcbiAgICAgICAgb3B0aW9uLmZ1bGxUeXBlLmNvbGxlY3Rpb24uZWxlbWVudHR5cGUucHJpbWl0aXZlXG4gICAgICApXG4gICk7XG59XG5cbi8qKlxuICogR2l2ZW4gYSB2YWx1ZSBmcm9tIFwiQGRlZmF1bHRcIiwgcHJvY2Vzc2VzIG1hY3JvcyBhbmQgcmV0dXJucyBhIHN0cmluZ2lmaWVkXG4gKiAocXVvdGVkKSByZXN1bHQuXG4gKlxuICogQHJldHVybnMgYSBqYXZhc2NyaXB0IHByaW1pdGl2ZSAoY291bGQgYmUgYSBzdHJpbmcsIG51bWJlciBvciBib29sZWFuKVxuICovXG5mdW5jdGlvbiByZW5kZXJEZWZhdWx0KGN3ZDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gIHJldHVybiB0cnlQcm9jZXNzTWFjcm8oY3dkLCB2YWx1ZSkgPz8gSlNPTi5wYXJzZSh2YWx1ZSk7XG59XG5cbi8qKlxuICogQ29udmVydHMgeWFyZ3MgY29tbWFuZCBsaW5lIHN3aXRjaGVzIHRvIHByb2plY3QgdHlwZSBwcm9wcy5cbiAqIEBwYXJhbSB0eXBlIFByb2plY3QgdHlwZVxuICogQHBhcmFtIGFyZ3YgQ29tbWFuZCBsaW5lIHN3aXRjaGVzXG4gKi9cbmZ1bmN0aW9uIGNvbW1hbmRMaW5lVG9Qcm9wcyhcbiAgY3dkOiBzdHJpbmcsXG4gIHR5cGU6IGludmVudG9yeS5Qcm9qZWN0VHlwZSxcbiAgYXJndjogUmVjb3JkPHN0cmluZywgdW5rbm93bj5cbik6IFJlY29yZDxzdHJpbmcsIGFueT4ge1xuICBjb25zdCBwcm9wczogUmVjb3JkPHN0cmluZywgYW55PiA9IHt9O1xuXG4gIC8vIGluaXRpYWxpemUgcHJvcHMgd2l0aCBkZWZhdWx0IHZhbHVlc1xuICBmb3IgKGNvbnN0IHByb3Agb2YgdHlwZS5vcHRpb25zKSB7XG4gICAgcHJvcHNbcHJvcC5uYW1lXSA9IGFyZ0luaXRpYWxWYWx1ZShwcm9wLCBjd2QpO1xuICB9XG5cbiAgZm9yIChjb25zdCBbYXJnLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoYXJndikpIHtcbiAgICBmb3IgKGNvbnN0IHByb3Agb2YgdHlwZS5vcHRpb25zKSB7XG4gICAgICBpZiAocHJvcC5zd2l0Y2ggPT09IGFyZykge1xuICAgICAgICBsZXQgY3VyciA9IHByb3BzO1xuICAgICAgICBjb25zdCBxdWV1ZSA9IFsuLi5wcm9wLnBhdGhdO1xuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgIGNvbnN0IHAgPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgIGlmICghcCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGN1cnJbcF0gPSB2YWx1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY3VycltwXSA9IGN1cnJbcF0gPz8ge307XG4gICAgICAgICAgICBjdXJyID0gY3VycltwXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gcHJvcHM7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgbmV3IHByb2plY3QgZnJvbSBhbiBleHRlcm5hbCBtb2R1bGUuXG4gKlxuICogQHBhcmFtIHNwZWMgVGhlIG5hbWUgb2YgdGhlIGV4dGVybmFsIG1vZHVsZSB0byBsb2FkXG4gKiBAcGFyYW0gYXJncyBDb21tYW5kIGxpbmUgYXJndW1lbnRzIChpbmNsLiBwcm9qZWN0IHR5cGUpXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGluaXRQcm9qZWN0RnJvbU1vZHVsZShiYXNlRGlyOiBzdHJpbmcsIHNwZWM6IHN0cmluZywgYXJnczogYW55KSB7XG4gIGNvbnN0IHByb2plblZlcnNpb24gPSBhcmdzLnByb2plblZlcnNpb24gPz8gXCJsYXRlc3RcIjtcbiAgY29uc3QgaW5zdGFsbENvbW1hbmQgPSByZW5kZXJJbnN0YWxsQ29tbWFuZChcbiAgICBiYXNlRGlyLFxuICAgIGBwcm9qZW5AJHtwcm9qZW5WZXJzaW9ufWBcbiAgKTtcbiAgaWYgKGFyZ3MucHJvamVuVmVyc2lvbikge1xuICAgIGV4ZWMoaW5zdGFsbENvbW1hbmQsIHsgY3dkOiBiYXNlRGlyIH0pO1xuICB9IGVsc2Uge1xuICAgIC8vIGRvIG5vdCBvdmVyd3JpdGUgZXhpc3RpbmcgaW5zdGFsbGF0aW9uXG4gICAgZXhlYyhcbiAgICAgIGBucG0gbHMgLS1wcmVmaXg9XCIke2Jhc2VEaXJ9XCIgLS1kZXB0aD0wIC0tcGF0dGVybiBwcm9qZW4gfHwgJHtpbnN0YWxsQ29tbWFuZH1gLFxuICAgICAgeyBjd2Q6IGJhc2VEaXIgfVxuICAgICk7XG4gIH1cblxuICBjb25zdCBpbnN0YWxsUGFja2FnZVdpdGhDbGlFcnJvciA9IChiOiBzdHJpbmcsIHM6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBpbnN0YWxsUGFja2FnZShiLCBzKTtcbiAgICB9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuICAgICAgY29uc3Qgc3RkZXJyID1cbiAgICAgICAgKGVycm9yIGFzIFNwYXduU3luY1JldHVybnM8QnVmZmVyPik/LnN0ZGVycj8udG9TdHJpbmcoKSA/PyBcIlwiO1xuICAgICAgY29uc3QgaXNMb2NhbCA9IHN0ZGVyci5pbmNsdWRlcyhcImNvZGUgRU5PRU5UXCIpO1xuICAgICAgY29uc3QgaXNSZWdpc3RyeSA9IHN0ZGVyci5pbmNsdWRlcyhcImNvZGUgRTQwNFwiKTtcbiAgICAgIGlmIChpc0xvY2FsIHx8IGlzUmVnaXN0cnkpIHtcbiAgICAgICAgY29uc3QgbW9kdWxlU291cmNlID0gaXNMb2NhbCA/IFwicGF0aFwiIDogXCJyZWdpc3RyeVwiO1xuICAgICAgICB0aHJvdyBuZXcgQ2xpRXJyb3IoXG4gICAgICAgICAgYENvdWxkIG5vdCBmaW5kICcke3N9JyBpbiB0aGlzICR7bW9kdWxlU291cmNlfS4gUGxlYXNlIGVuc3VyZSB0aGF0IHRoZSBwYWNrYWdlIGV4aXN0cywgeW91IGhhdmUgYWNjZXNzIGl0IGFuZCB0cnkgYWdhaW4uYFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgbW9kdWxlTmFtZSA9IGluc3RhbGxQYWNrYWdlV2l0aENsaUVycm9yKGJhc2VEaXIsIHNwZWMpO1xuICBsb2dnaW5nLmVtcHR5KCk7XG5cbiAgLy8gRmluZCB0aGUganVzdCBpbnN0YWxsZWQgcGFja2FnZSBhbmQgZGlzY292ZXIgdGhlIHJlc3QgcmVjdXJzaXZlbHkgZnJvbSB0aGlzIHBhY2thZ2UgZm9sZGVyXG4gIGNvbnN0IG1vZHVsZURpciA9IGZpbmRKc2lpRmlsZVBhdGgoYmFzZURpciwgbW9kdWxlTmFtZSk7XG5cbiAgaWYgKCFtb2R1bGVEaXIpIHtcbiAgICB0aHJvdyBuZXcgQ2xpRXJyb3IoXG4gICAgICBgTW9kdWxlICcke21vZHVsZU5hbWV9JyBkb2VzIG5vdCBsb29rIGxpa2UgaXQgaXMgY29tcGF0aWJsZSB3aXRoIHByb2plbi4gUmVhc29uOiBDYW5ub3QgZmluZCAnJHttb2R1bGVOYW1lfS8uanNpaScuIEFsbCBwcm9qZW4gbW9kdWxlcyBtdXN0IGJlIGpzaWkgbW9kdWxlcyFgXG4gICAgKTtcbiAgfVxuXG4gIC8vIE9ubHkgbGVhdmUgcHJvamVjdHMgZnJvbSB0aGUgbWFpbiAocmVxdWVzdGVkKSBwYWNrYWdlXG4gIGNvbnN0IHByb2plY3RzID0gaW52ZW50b3J5XG4gICAgLmRpc2NvdmVyKG1vZHVsZURpcilcbiAgICAuZmlsdGVyKCh4KSA9PiB4Lm1vZHVsZU5hbWUgPT09IG1vZHVsZU5hbWUpOyAvLyBPbmx5IGxpc3QgcHJvamVjdCB0eXBlcyBmcm9tIHRoZSByZXF1ZXN0ZWQgJ2Zyb20nIG1vZHVsZVxuXG4gIGlmIChwcm9qZWN0cy5sZW5ndGggPCAxKSB7XG4gICAgdGhyb3cgbmV3IENsaUVycm9yKFxuICAgICAgYE5vIHByb2plY3QgdHlwZXMgZm91bmQgYWZ0ZXIgaW5zdGFsbGluZyBcIiR7c3BlY31cIi4gVGhlIG1vZHVsZSBtdXN0IGV4cG9ydCBhdCBsZWFzdCBvbmUgY2xhc3Mgd2hpY2ggZXh0ZW5kcyBcInByb2plbi5Qcm9qZWN0XCIuYFxuICAgICk7XG4gIH1cblxuICBjb25zdCByZXF1ZXN0ZWQgPSBhcmdzLnByb2plY3RUeXBlTmFtZTtcbiAgY29uc3QgdHlwZXMgPSBwcm9qZWN0cy5tYXAoKHApID0+IHAucGppZCk7XG5cbiAgLy8gaWYgdXNlciBkaWQgbm90IHNwZWNpZnkgYSBwcm9qZWN0IHR5cGUgYnV0IHRoZSBtb2R1bGUgaGFzIG1vcmUgdGhhbiBvbmUsIHdlIG5lZWQgdGhlbSB0byB0ZWxsIHVzIHdoaWNoIG9uZS4uLlxuICBpZiAoIXJlcXVlc3RlZCAmJiBwcm9qZWN0cy5sZW5ndGggPiAxKSB7XG4gICAgdGhyb3cgbmV3IENsaUVycm9yKFxuICAgICAgYE11bHRpcGxlIHByb2plY3QgdHlwZXMgZm91bmQgYWZ0ZXIgaW5zdGFsbGluZyBcIiR7c3BlY31cIjpcXG5gLFxuICAgICAgLi4udHlwZXMubWFwKCh0KSA9PiBgICAgICR7dH1gKSxcbiAgICAgIFwiXCIsXG4gICAgICBgUGxlYXNlIHNwZWNpZnkgYSBwcm9qZWN0IHR5cGUuYCxcbiAgICAgIGBFeGFtcGxlOiBucHggcHJvamVuIG5ldyAtLWZyb20gJHtzcGVjfSAke3R5cGVzWzBdfWBcbiAgICApO1xuICB9XG5cbiAgLy8gaWYgdXNlciBkaWQgbm90IHNwZWNpZnkgYSB0eXBlIChhbmQgd2Uga25vdyB3ZSBoYXZlIG9ubHkgb25lKSwgdGhlIHNlbGVjdCBpdC4gb3RoZXJ3aXNlLCBzZWFyY2ggYnkgcGppZC5cbiAgY29uc3QgdHlwZSA9ICFyZXF1ZXN0ZWRcbiAgICA/IHByb2plY3RzWzBdXG4gICAgOiBwcm9qZWN0cy5maW5kKChwKSA9PiBwLnBqaWQgPT09IHJlcXVlc3RlZCk7XG4gIGlmICghdHlwZSkge1xuICAgIHRocm93IG5ldyBDbGlFcnJvcihcbiAgICAgIGBQcm9qZWN0IHR5cGUgXCIke3JlcXVlc3RlZH1cIiBub3QgZm91bmQgaW4gXCIke3NwZWN9XCIuIEZvdW5kOlxcbmAsXG4gICAgICAuLi50eXBlcy5tYXAoKHQpID0+IGAgICAgJHt0fWApLFxuICAgICAgXCJcIixcbiAgICAgIGBQbGVhc2Ugc3BlY2lmeSBhIHZhbGlkIHByb2plY3QgdHlwZS5gLFxuICAgICAgYEV4YW1wbGU6IG5weCBwcm9qZW4gbmV3IC0tZnJvbSAke3NwZWN9ICR7dHlwZXNbMF19YFxuICAgICk7XG4gIH1cblxuICBjb25zdCBtaXNzaW5nT3B0aW9ucyA9IFtdO1xuXG4gIGZvciAoY29uc3Qgb3B0aW9uIG9mIHR5cGUub3B0aW9ucyA/PyBbXSkge1xuICAgIC8vIG5vdCBhbGwgdHlwZXMgY2FuIGJlIHJlcHJlc2VudGVkIGluIHRoZSBjbGlcbiAgICBpZiAoIWFyZ1R5cGVTdXBwb3J0ZWQob3B0aW9uKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgLy8gcGFyc2UgYWxsb3dlZCB0eXBlc1xuICAgIGlmIChhcmdzW29wdGlvbi5uYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhcmdzW29wdGlvbi5uYW1lXSA9IHBhcnNlQXJnKGFyZ3Nbb3B0aW9uLm5hbWVdLCBhcmdUeXBlKG9wdGlvbiksIG9wdGlvbik7XG4gICAgICBhcmdzW29wdGlvbi5zd2l0Y2hdID0gYXJnc1tvcHRpb24ubmFtZV07XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvLyBSZXF1aXJlZCBvcHRpb24gd2l0aCBhIGRlZmF1bHRcbiAgICBpZiAoIW9wdGlvbi5vcHRpb25hbCAmJiBvcHRpb24uZGVmYXVsdCAmJiBvcHRpb24uZGVmYXVsdCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgY29uc3QgZGVmYXVsdFZhbHVlID0gcmVuZGVyRGVmYXVsdChiYXNlRGlyLCBvcHRpb24uZGVmYXVsdCk7XG4gICAgICBhcmdzW29wdGlvbi5uYW1lXSA9IGRlZmF1bHRWYWx1ZTtcbiAgICAgIGFyZ3Nbb3B0aW9uLnN3aXRjaF0gPSBkZWZhdWx0VmFsdWU7XG4gICAgfVxuXG4gICAgLy8gUmVxdWlyZWQgb3B0aW9uLCBidXQgd2UgY291bGQgbm90IGZpbmQgYSB2YWx1ZVxuICAgIGlmICghb3B0aW9uLm9wdGlvbmFsICYmICFhcmdzW29wdGlvbi5uYW1lXSkge1xuICAgICAgbWlzc2luZ09wdGlvbnMucHVzaChcbiAgICAgICAgYC0tJHtvcHRpb24uc3dpdGNofSBbJHthcmdUeXBlKG9wdGlvbil9XSAke2FyZ0Rlc2Mob3B0aW9uKX1gXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8vIFdlIGFyZSBtaXNzaW5nIHNvbWUgcmVxdWlyZWQgb3B0aW9uc1xuICBpZiAobWlzc2luZ09wdGlvbnMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IENsaUVycm9yKFxuICAgICAgYENhbm5vdCBjcmVhdGUgXCIke3R5cGUuZnFufVwiLiBNaXNzaW5nIHJlcXVpcmVkIG9wdGlvbiR7XG4gICAgICAgIG1pc3NpbmdPcHRpb25zLmxlbmd0aCA+IDEgPyBcInNcIiA6IFwiXCJcbiAgICAgIH06YCxcbiAgICAgIC4uLm1pc3NpbmdPcHRpb25zLm1hcCgobSkgPT4gYCAgICAke219YClcbiAgICApO1xuICB9XG5cbiAgLy8gaW5jbHVkZSBhIGRldiBkZXBlbmRlbmN5IGZvciB0aGUgZXh0ZXJuYWwgbW9kdWxlXG4gIGFyZ3MuZGV2RGVwcyA9IFtzcGVjXTtcbiAgYXJnc1tcImRldi1kZXBzXCJdID0gW3NwZWNdO1xuXG4gIGF3YWl0IGluaXRQcm9qZWN0KGJhc2VEaXIsIHR5cGUsIGFyZ3MpO1xufVxuXG4vKipcbiAqIFBhcnNlIGNvbW1hbmQgbGluZSB2YWx1ZSBhcyBvcHRpb24gdHlwZVxuICovXG5mdW5jdGlvbiBwYXJzZUFyZyhcbiAgdmFsdWU6IGFueSxcbiAgdHlwZTogc3RyaW5nLFxuICBvcHRpb24/OiBpbnZlbnRvcnkuUHJvamVjdE9wdGlvblxuKTogYW55IHtcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgcmV0dXJuIHBhcnNlSW50KHZhbHVlKTtcbiAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiA/IGlzVHJ1dGh5KHZhbHVlKSA6IHZhbHVlO1xuICAgIGNhc2UgXCJhcnJheVwiOlxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICB2YWx1ZSA9IFt2YWx1ZV07XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWUubWFwKCh2OiBhbnkpID0+XG4gICAgICAgIHBhcnNlQXJnKFxuICAgICAgICAgIHYsXG4gICAgICAgICAgb3B0aW9uPy5mdWxsVHlwZS5jb2xsZWN0aW9uPy5lbGVtZW50dHlwZS5wcmltaXRpdmUgfHwgXCJzdHJpbmdcIlxuICAgICAgICApXG4gICAgICApO1xuICAgIC8vIHJldHVybiB2YWx1ZSB1bmNoYW5nZWRcbiAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIGlmIHdlIGhhdmUgYW4gdW5leHBlY3RlZCBhcnJheSwgdXNlIHRoZSBmaXJzdCBlbGVtZW50XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlWzBdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICB9XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgbmV3IHByb2plY3QuXG4gKiBAcGFyYW0gdHlwZSBQcm9qZWN0IHR5cGVcbiAqIEBwYXJhbSBhcmdzIENvbW1hbmQgbGluZSBhcmd1bWVudHNcbiAqIEBwYXJhbSBhZGRpdGlvbmFsUHJvcHMgQWRkaXRpb25hbCBwYXJhbWV0ZXJzIHRvIGluY2x1ZGUgaW4gLnByb2plbnJjLmpzXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGluaXRQcm9qZWN0KFxuICBiYXNlRGlyOiBzdHJpbmcsXG4gIHR5cGU6IGludmVudG9yeS5Qcm9qZWN0VHlwZSxcbiAgYXJnczogYW55XG4pIHtcbiAgLy8gY29udmVydCBjb21tYW5kIGxpbmUgYXJndW1lbnRzIHRvIHByb2plY3QgcHJvcHMgdXNpbmcgdHlwZSBpbmZvcm1hdGlvblxuICBjb25zdCBwcm9wcyA9IGNvbW1hbmRMaW5lVG9Qcm9wcyhiYXNlRGlyLCB0eXBlLCBhcmdzKTtcblxuICBQcm9qZWN0cy5jcmVhdGVQcm9qZWN0KHtcbiAgICBkaXI6IHByb3BzLm91dGRpciA/PyBiYXNlRGlyLFxuICAgIHByb2plY3RGcW46IHR5cGUuZnFuLFxuICAgIHByb2plY3RPcHRpb25zOiBwcm9wcyxcbiAgICBvcHRpb25IaW50czogYXJncy5jb21tZW50c1xuICAgICAgPyBJbml0UHJvamVjdE9wdGlvbkhpbnRzLkZFQVRVUkVEXG4gICAgICA6IEluaXRQcm9qZWN0T3B0aW9uSGludHMuTk9ORSxcbiAgICBzeW50aDogYXJncy5zeW50aCxcbiAgICBwb3N0OiBhcmdzLnBvc3QsXG4gIH0pO1xuXG4gIGlmIChmcy5leGlzdHNTeW5jKHBhdGguam9pbihiYXNlRGlyLCBcInBhY2thZ2UuanNvblwiKSkgJiYgYXJncy5wb3N0KSB7XG4gICAgZXhlYyhcIm5wbSBydW4gZXNsaW50IC0taWYtcHJlc2VudFwiLCB7IGN3ZDogYmFzZURpciB9KTtcbiAgfVxuXG4gIGlmIChhcmdzLmdpdCkge1xuICAgIGNvbnN0IGdpdCA9IChjbWQ6IHN0cmluZykgPT4gZXhlYyhgZ2l0ICR7Y21kfWAsIHsgY3dkOiBiYXNlRGlyIH0pO1xuICAgIGNvbnN0IGdpdHZlcnNpb246IHN0cmluZyA9IGdldEdpdFZlcnNpb24oXG4gICAgICBleGVjQ2FwdHVyZShcImdpdCAtLXZlcnNpb25cIiwgeyBjd2Q6IGJhc2VEaXIgfSkudG9TdHJpbmcoKVxuICAgICk7XG4gICAgbG9nZ2luZy5kZWJ1ZyhcInN5c3RlbSB1c2luZyBnaXQgdmVyc2lvbiBcIiwgZ2l0dmVyc2lvbik7XG4gICAgLy8gYGdpdCBjb25maWcgaW5pdC5kZWZhdWx0QnJhbmNoYCBhbmQgYGdpdCBpbml0IC1iYCBhcmUgb25seSBhdmFpbGFibGUgc2luY2UgZ2l0IDIuMjguMFxuICAgIGlmIChnaXR2ZXJzaW9uICYmIHNlbXZlci5ndGUoZ2l0dmVyc2lvbiwgXCIyLjI4LjBcIikpIHtcbiAgICAgIGNvbnN0IGRlZmF1bHRHaXRJbml0QnJhbmNoID1cbiAgICAgICAgZXhlY09yVW5kZWZpbmVkKFwiZ2l0IGNvbmZpZyBpbml0LmRlZmF1bHRCcmFuY2hcIiwge1xuICAgICAgICAgIGN3ZDogYmFzZURpcixcbiAgICAgICAgfSk/LnRyaW0oKSB8fCBcIm1haW5cIjtcbiAgICAgIGdpdChgaW5pdCAtYiAke2RlZmF1bHRHaXRJbml0QnJhbmNofWApO1xuICAgICAgZ2l0KFwiYWRkIC5cIik7XG4gICAgICBnaXQoJ2NvbW1pdCAtLWFsbG93LWVtcHR5IC1tIFwiY2hvcmU6IHByb2plY3QgY3JlYXRlZCB3aXRoIHByb2plblwiJyk7XG4gICAgICBsb2dnaW5nLmRlYnVnKGBkZWZhdWx0IGJyYW5jaCBuYW1lIHNldCB0byAke2RlZmF1bHRHaXRJbml0QnJhbmNofWApO1xuICAgIH0gZWxzZSB7XG4gICAgICBnaXQoXCJpbml0XCIpO1xuICAgICAgZ2l0KFwiYWRkIC5cIik7XG4gICAgICBnaXQoJ2NvbW1pdCAtLWFsbG93LWVtcHR5IC1tIFwiY2hvcmU6IHByb2plY3QgY3JlYXRlZCB3aXRoIHByb2plblwiJyk7XG4gICAgICBsb2dnaW5nLmRlYnVnKFxuICAgICAgICBcIm9sZGVyIHZlcnNpb24gb2YgZ2l0IGRldGVjdGVkLCBjaGFuZ2VkIGRlZmF1bHQgYnJhbmNoIG5hbWUgdG8gbWFpblwiXG4gICAgICApO1xuICAgICAgZ2l0KFwiYnJhbmNoIC1NIG1haW5cIik7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBDb21tYW5kKCk7XG4iXX0=