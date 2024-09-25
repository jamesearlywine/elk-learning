"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeCrossPlatform = makeCrossPlatform;
/**
 * Makes a cross-shell command that works on both Windows and Unix-like systems.
 *
 * @param command The command to make cross-platform.
 * @returns
 */
function makeCrossPlatform(command) {
    const isWindows = process.platform === "win32";
    if (!isWindows) {
        return command;
    }
    return command
        .split("&&")
        .map((subcommand) => {
        const trimmedSubcommand = subcommand.trim();
        const cmd = trimmedSubcommand.split(" ")[0];
        const supportedByShx = ["cat", "cp", "mkdir", "mv", "rm"].includes(cmd);
        return supportedByShx ? `shx ${trimmedSubcommand}` : trimmedSubcommand;
    })
        .join(" && ");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbC90YXNrcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU1BLDhDQWlCQztBQXZCRDs7Ozs7R0FLRztBQUNILFNBQWdCLGlCQUFpQixDQUFDLE9BQWU7SUFDL0MsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFFBQVEsS0FBSyxPQUFPLENBQUM7SUFDL0MsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2YsT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVELE9BQU8sT0FBTztTQUNYLEtBQUssQ0FBQyxJQUFJLENBQUM7U0FDWCxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsRUFBRTtRQUNsQixNQUFNLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM1QyxNQUFNLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFNUMsTUFBTSxjQUFjLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXhFLE9BQU8sY0FBYyxDQUFDLENBQUMsQ0FBQyxPQUFPLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDO0lBQ3pFLENBQUMsQ0FBQztTQUNELElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBNYWtlcyBhIGNyb3NzLXNoZWxsIGNvbW1hbmQgdGhhdCB3b3JrcyBvbiBib3RoIFdpbmRvd3MgYW5kIFVuaXgtbGlrZSBzeXN0ZW1zLlxuICpcbiAqIEBwYXJhbSBjb21tYW5kIFRoZSBjb21tYW5kIHRvIG1ha2UgY3Jvc3MtcGxhdGZvcm0uXG4gKiBAcmV0dXJuc1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWFrZUNyb3NzUGxhdGZvcm0oY29tbWFuZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgaXNXaW5kb3dzID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gXCJ3aW4zMlwiO1xuICBpZiAoIWlzV2luZG93cykge1xuICAgIHJldHVybiBjb21tYW5kO1xuICB9XG5cbiAgcmV0dXJuIGNvbW1hbmRcbiAgICAuc3BsaXQoXCImJlwiKVxuICAgIC5tYXAoKHN1YmNvbW1hbmQpID0+IHtcbiAgICAgIGNvbnN0IHRyaW1tZWRTdWJjb21tYW5kID0gc3ViY29tbWFuZC50cmltKCk7XG4gICAgICBjb25zdCBjbWQgPSB0cmltbWVkU3ViY29tbWFuZC5zcGxpdChcIiBcIilbMF07XG5cbiAgICAgIGNvbnN0IHN1cHBvcnRlZEJ5U2h4ID0gW1wiY2F0XCIsIFwiY3BcIiwgXCJta2RpclwiLCBcIm12XCIsIFwicm1cIl0uaW5jbHVkZXMoY21kKTtcblxuICAgICAgcmV0dXJuIHN1cHBvcnRlZEJ5U2h4ID8gYHNoeCAke3RyaW1tZWRTdWJjb21tYW5kfWAgOiB0cmltbWVkU3ViY29tbWFuZDtcbiAgICB9KVxuICAgIC5qb2luKFwiICYmIFwiKTtcbn1cbiJdfQ==