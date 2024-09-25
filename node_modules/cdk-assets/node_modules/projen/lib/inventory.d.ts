type JsiiTypes = {
    [name: string]: JsiiType;
};
export interface ProjectOption {
    path: string[];
    name: string;
    fqn?: string;
    switch: string;
    /** Simple type name, e.g. "string", "boolean", "number", "EslintOptions", "MyEnum". Collections are "unknown" */
    simpleType: string;
    /** Full JSII type, e.g. { primitive: "string" } or { collection: { elementtype: { primitive: 'string' }, kind: 'map' } } */
    fullType: JsiiPropertyType;
    kind?: "class" | "enum" | "interface";
    jsonLike?: boolean;
    parent: string;
    docs?: string;
    default?: string;
    /**
     * The value that will be used at initial project creation
     */
    initialValue?: string;
    optional?: boolean;
    deprecated?: boolean;
    featured?: boolean;
}
export interface ProjectType {
    moduleName: string;
    pjid: string;
    fqn: string;
    typename: string;
    options: ProjectOption[];
    docs?: string;
    docsurl: string;
}
interface JsiiType {
    name: string;
    assembly: string;
    kind: string;
    abstract?: boolean;
    base?: string;
    fqn: string;
    interfaces?: string[];
    initializer?: {
        parameters?: Array<{
            name: string;
            type?: {
                fqn?: string;
            };
        }>;
    };
    properties?: Array<{
        name: string;
        docs: {
            summary?: string;
            default?: string;
            deprecated?: string;
            stability?: string;
            custom?: {
                [name: string]: string;
            };
        };
        optional?: boolean;
        type?: JsiiPropertyType;
    }>;
    docs?: {
        summary?: string;
        deprecated?: string;
        custom?: {
            pjid?: string;
            pjnew?: string;
        };
    };
}
export interface JsiiPropertyType {
    primitive?: string;
    fqn?: string;
    collection?: {
        elementtype: JsiiPropertyType;
        kind: string;
    };
}
/**
 * Returns a list of project types exported the modules defined in `moduleDirs`.
 * This list will always also include the built-in projen project types.
 * Modules without a .jsii manifest are skipped.
 *
 * @param moduleDirs A list of npm module directories
 */
export declare function discover(...moduleDirs: string[]): ProjectType[];
export declare function readManifest(dir: string): any;
export declare function resolveProjectType(projectFqn: string): ProjectType;
export declare function toProjectType(jsii: JsiiTypes, fqn: string): ProjectType;
export declare function readJsiiManifest(jsiiFqn: string): any;
export {};
