import type { IConstruct } from "constructs";
import type { Component } from "../component";
import type { Project } from "../project";
export declare const PROJECT_SYMBOL: unique symbol;
export declare const COMPONENT_SYMBOL: unique symbol;
/**
 * Create a function to find the closest construct matching a predicate
 * @param predicate
 * @returns A function to find the closest construct matching the predicate
 */
export declare function tryFindClosest<T extends IConstruct>(predicate: (x: any) => x is T): (construct?: IConstruct) => T | undefined;
/**
 * Create a function to find the closest construct matching a predicate
 * @param predicate
 * @returns A function to find the closest construct matching the predicate
 */
export declare function findClosestProject(construct: IConstruct): Project;
export declare function isProject(x: unknown): x is Project;
export declare function isComponent(x: unknown): x is Component;
export declare function tagAsProject(scope: IConstruct): void;
export declare function tagAsComponent(scope: IConstruct): void;
