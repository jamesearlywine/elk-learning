import { FileBase, IResolver } from "./file";
import { Project } from "./project";
export interface LicenseOptions {
    /**
     * License type (SPDX).
     *
     * @see https://github.com/projen/projen/tree/main/license-text for list of supported licenses
     */
    readonly spdx: string;
    /**
     * Copyright owner.
     *
     * If the license text has $copyright_owner, this option must be specified.
     *
     * @default -
     */
    readonly copyrightOwner?: string;
    /**
     * Period of license (e.g. "1998-2023")
     *
     * The string `$copyright_period` will be substituted with this string.
     *
     * @default - current year (e.g. "2020")
     */
    readonly copyrightPeriod?: string;
}
export declare class License extends FileBase {
    private readonly text;
    constructor(project: Project, options: LicenseOptions);
    protected synthesizeContent(_: IResolver): string | undefined;
}
