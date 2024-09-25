/**
 * Feature flags as of v1.130.0
 */
export declare const FEATURE_FLAGS: string[];
/**
 * Suffix for AWS Lambda handlers.
 */
export declare const TYPESCRIPT_LAMBDA_EXT = ".lambda.ts";
/**
 * Suffix for AWS Edge Lambda handlers.
 */
export declare const TYPESCRIPT_EDGE_LAMBDA_EXT = ".edge-lambda.ts";
/**
 * Suffix for AWS Lambda Extensions.
 */
export declare const TYPESCRIPT_LAMBDA_EXTENSION_EXT = ".lambda-extension.ts";
/**
 * Converts the given path string to posix if it wasn't already.
 */
export declare function convertToPosixPath(p: string): string;
