import { IPackageProvider } from "./python-deps";
import { FileBase, IResolver } from "../file";
import { Project } from "../project";
export interface RequirementsFileOptions {
    /**
     * Provide a list of packages that can be dynamically updated.
     */
    readonly packageProvider?: IPackageProvider;
}
/**
 * Specifies a list of packages to be installed using pip.
 *
 * @see https://pip.pypa.io/en/stable/reference/pip_install/#requirements-file-format
 */
export declare class RequirementsFile extends FileBase {
    private readonly packages;
    private readonly packageProvider?;
    constructor(project: Project, filePath: string, options: RequirementsFileOptions);
    /**
     * Adds the specified packages provided in semver format.
     *
     * Comment lines (start with `#`) are ignored.
     *
     * @param packages Package version in format `<module>@<semver>`
     */
    addPackages(...packages: string[]): void;
    private formatDependency;
    protected synthesizeContent(resolver: IResolver): string | undefined;
}
