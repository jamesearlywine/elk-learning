import { Tools } from "../github/workflows-model";
export type JsiiPacmakTarget = "js" | "go" | "java" | "python" | "dotnet";
/**
 * GitHub workflow job steps for setting up the tools required for various JSII targets.
 */
export declare const JSII_TOOLCHAIN: Record<JsiiPacmakTarget, Tools>;
