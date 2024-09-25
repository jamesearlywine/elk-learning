import { IResolver } from "./file";
import { ObjectFile, ObjectFileOptions } from "./object-file";
import { Project } from "./project";
/**
 * Options for `XmlFile`.
 */
export interface XmlFileOptions extends ObjectFileOptions {
}
/**
 * Represents an XML file.
 *
 * Objects passed in will be synthesized using the npm "xml" library.
 * @see https://www.npmjs.com/package/xml
 */
export declare class XmlFile extends ObjectFile {
    constructor(project: Project, filePath: string, options?: XmlFileOptions);
    protected synthesizeContent(resolver: IResolver): string | undefined;
}
