import { StaleBehavior } from "./stale";
interface Options {
    readonly stale: number;
    readonly close: number;
    readonly type: string;
}
export declare function renderBehavior(behavior: StaleBehavior | undefined, opts: Options): Partial<StaleBehavior>;
export {};
