/**
 *
 * @param obj Any object
 * @returns The same object but with no properties whose value is `null` or `undefined`
 */
export declare const removeNullOrUndefinedProperties: <TObj extends Record<string, any>>(obj: TObj) => TObj;
