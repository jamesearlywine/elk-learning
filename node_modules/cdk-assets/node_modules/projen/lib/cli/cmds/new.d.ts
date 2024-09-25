import * as yargs from "yargs";
declare class Command implements yargs.CommandModule {
    readonly command = "new [PROJECT-TYPE-NAME] [OPTIONS]";
    readonly describe: string;
    builder(args: yargs.Argv): yargs.Argv<{}>;
    handler(args: any): Promise<void>;
}
declare const _default: Command;
export default _default;
