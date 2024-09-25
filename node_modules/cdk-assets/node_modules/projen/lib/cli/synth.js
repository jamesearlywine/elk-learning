"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.synth = synth;
const child_process_1 = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const common_1 = require("../common");
const logging = require("../logging");
const project_1 = require("../project");
const projenModule = path.dirname(require.resolve("../../package.json"));
async function synth(runtime, options) {
    const workdir = runtime.workdir;
    const rcfile = path.resolve(workdir, options.rcfile ?? common_1.DEFAULT_PROJEN_RC_JS_FILENAME); // TODO: support non javascript projenrc (e.g. java projects)
    // if --rc points to .projenrc.js, then behave as if it wasn't specified.
    if (rcfile === path.resolve(workdir, common_1.DEFAULT_PROJEN_RC_JS_FILENAME)) {
        delete options.rcfile;
    }
    // if there are no tasks, we assume this is not a projen project (modern
    // projects must at least have the "default" task).
    if (runtime.tasks.length === 0 && !fs.existsSync(rcfile)) {
        logging.error('Unable to find projen project. Use "projen new" to create a new project.');
        process.exit(1);
    }
    // run synth once
    const success = await trySynth();
    if (options.watch) {
        // if we are in watch mode, start the watch loop
        watchLoop();
    }
    else if (!success) {
        // make sure exit code is non-zero if we are not in watch mode
        process.exit(1);
    }
    async function trySynth() {
        // determine if post synthesis tasks should be executed (e.g. "yarn install").
        process.env.PROJEN_DISABLE_POST = (!options.post).toString();
        try {
            const defaultTask = runtime.tasks.find((t) => t.name === project_1.Project.DEFAULT_TASK);
            // if "--rc" is specified, ignore the default task
            if (defaultTask) {
                if (!options.rcfile) {
                    runtime.runTask(defaultTask.name);
                    return true;
                }
                else {
                    logging.warn("Default task skipped. Trying legacy synthesis since --rc is specified");
                }
            }
            // for backwards compatibility, if there is a .projenrc.js file, default to "node .projenrc.js"
            if (tryLegacySynth()) {
                return true;
            }
            throw new Error('Unable to find a task named "default"');
        }
        catch (e) {
            logging.error(`Synthesis failed: ${e.message}`);
            return false;
        }
    }
    function watchLoop() {
        logging.info(`Watching for changes in ${workdir}...`);
        const watch = fs.watch(workdir, { recursive: true });
        watch.on("change", (event) => {
            // we only care about "change" events
            if (event !== "change") {
                return;
            }
            process.stdout.write("\x1Bc"); // clear screen
            watch.close();
            trySynth()
                .then(() => watchLoop())
                .catch(() => watchLoop());
        });
    }
    function tryLegacySynth() {
        const rcdir = path.dirname(rcfile);
        if (!fs.existsSync(rcfile)) {
            return false;
        }
        // if node_modules/projen is not a directory or does not exist, create a
        // temporary symlink to the projen that we are currently running in order to
        // allow .projenrc.js to `require()` it.
        const nodeModules = path.resolve(rcdir, "node_modules");
        const projenModulePath = path.resolve(nodeModules, "projen");
        if (!fs.existsSync(path.join(projenModulePath, "package.json")) ||
            !fs.statSync(projenModulePath).isDirectory()) {
            fs.rmSync(projenModulePath, { force: true, recursive: true });
            fs.mkdirSync(nodeModules, { recursive: true });
            fs.symlinkSync(projenModule, projenModulePath, os.platform() === "win32" ? "junction" : null);
        }
        const ret = (0, child_process_1.spawnSync)(process.execPath, [rcfile], {
            stdio: ["inherit", "inherit", "pipe"],
        });
        if (ret.error) {
            throw new Error(`Synthesis failed: ${ret.error}`);
        }
        else if (ret.status !== 0) {
            logging.error(ret.stderr.toString());
            throw new Error(`Synthesis failed: calling "${process.execPath} ${rcfile}" exited with status=${ret.status}`);
        }
        return true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ludGguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY2xpL3N5bnRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBK0JBLHNCQXdIQztBQXZKRCxpREFBMEM7QUFDMUMseUJBQXlCO0FBQ3pCLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0Isc0NBQTBEO0FBQzFELHNDQUFzQztBQUN0Qyx3Q0FBcUM7QUFHckMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztBQXNCbEUsS0FBSyxVQUFVLEtBQUssQ0FBQyxPQUFvQixFQUFFLE9BQXFCO0lBQ3JFLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7SUFDaEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FDekIsT0FBTyxFQUNQLE9BQU8sQ0FBQyxNQUFNLElBQUksc0NBQTZCLENBQ2hELENBQUMsQ0FBQyw2REFBNkQ7SUFFaEUseUVBQXlFO0lBQ3pFLElBQUksTUFBTSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLHNDQUE2QixDQUFDLEVBQUUsQ0FBQztRQUNwRSxPQUFRLE9BQWUsQ0FBQyxNQUFNLENBQUM7SUFDakMsQ0FBQztJQUVELHdFQUF3RTtJQUN4RSxtREFBbUQ7SUFDbkQsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDekQsT0FBTyxDQUFDLEtBQUssQ0FDWCwwRUFBMEUsQ0FDM0UsQ0FBQztRQUNGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVELGlCQUFpQjtJQUNqQixNQUFNLE9BQU8sR0FBRyxNQUFNLFFBQVEsRUFBRSxDQUFDO0lBRWpDLElBQUksT0FBTyxDQUFD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O0lBQ2QsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzcGF3blN5bmMgfSBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgKiBhcyBvcyBmcm9tIFwib3NcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IERFRkFVTFRfUFJPSkVOX1JDX0pTX0ZJTEVOQU1FIH0gZnJvbSBcIi4uL2NvbW1vblwiO1xuaW1wb3J0ICogYXMgbG9nZ2luZyBmcm9tIFwiLi4vbG9nZ2luZ1wiO1xuaW1wb3J0IHsgUHJvamVjdCB9IGZyb20gXCIuLi9wcm9qZWN0XCI7XG5pbXBvcnQgeyBUYXNrUnVudGltZSB9IGZyb20gXCIuLi90YXNrLXJ1bnRpbWVcIjtcblxuY29uc3QgcHJvamVuTW9kdWxlID0gcGF0aC5kaXJuYW1lKHJlcXVpcmUucmVzb2x2ZShcIi4uLy4uL3BhY2thZ2UuanNvblwiKSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3ludGhPcHRpb25zIHtcbiAgLyoqXG4gICAqIEV4ZWN1dGUgcG9zdCBzeW50aGVzaXMgY29tbWFuZHMuXG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIHJlYWRvbmx5IHBvc3Q/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBTdGFydCB3YXRjaGluZyAucHJvamVucmMuanMgYW5kIHJlLXN5bnRoIHdoZW4gY2hhbmdlZC5cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHJlYWRvbmx5IHdhdGNoPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogVGhlIG5hbWUgb2YgdGhlIC5wcm9qZW5yYy5qcyBmaWxlICB0byB1c2UgaW5zdGVhZCBvZiB0aGUgZGVmYXVsdC5cbiAgICogQGRlZmF1bHQgXCIucHJvamVucmMuanNcIlxuICAgKi9cbiAgcmVhZG9ubHkgcmNmaWxlPzogc3RyaW5nO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3ludGgocnVudGltZTogVGFza1J1bnRpbWUsIG9wdGlvbnM6IFN5bnRoT3B0aW9ucykge1xuICBjb25zdCB3b3JrZGlyID0gcnVudGltZS53b3JrZGlyO1xuICBjb25zdCByY2ZpbGUgPSBwYXRoLnJlc29sdmUoXG4gICAgd29ya2RpcixcbiAgICBvcHRpb25zLnJjZmlsZSA/PyBERUZBVUxUX1BST0pFTl9SQ19KU19GSUxFTkFNRVxuICApOyAvLyBUT0RPOiBzdXBwb3J0IG5vbiBqYXZhc2NyaXB0IHByb2plbnJjIChlLmcuIGphdmEgcHJvamVjdHMpXG5cbiAgLy8gaWYgLS1yYyBwb2ludHMgdG8gLnByb2plbnJjLmpzLCB0aGVuIGJlaGF2ZSBhcyBpZiBpdCB3YXNuJ3Qgc3BlY2lmaWVkLlxuICBpZiAocmNmaWxlID09PSBwYXRoLnJlc29sdmUod29ya2RpciwgREVGQVVMVF9QUk9KRU5fUkNfSlNfRklMRU5BTUUpKSB7XG4gICAgZGVsZXRlIChvcHRpb25zIGFzIGFueSkucmNmaWxlO1xuICB9XG5cbiAgLy8gaWYgdGhlcmUgYXJlIG5vIHRhc2tzLCB3ZSBhc3N1bWUgdGhpcyBpcyBub3QgYSBwcm9qZW4gcHJvamVjdCAobW9kZXJuXG4gIC8vIHByb2plY3RzIG11c3QgYXQgbGVhc3QgaGF2ZSB0aGUgXCJkZWZhdWx0XCIgdGFzaykuXG4gIGlmIChydW50aW1lLnRhc2tzLmxlbmd0aCA9PT0gMCAmJiAhZnMuZXhpc3RzU3luYyhyY2ZpbGUpKSB7XG4gICAgbG9nZ2luZy5lcnJvcihcbiAgICAgICdVbmFibGUgdG8gZmluZCBwcm9qZW4gcHJvamVjdC4gVXNlIFwicHJvamVuIG5ld1wiIHRvIGNyZWF0ZSBhIG5ldyBwcm9qZWN0LidcbiAgICApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8vIHJ1biBzeW50aCBvbmNlXG4gIGNvbnN0IHN1Y2Nlc3MgPSBhd2FpdCB0cnlTeW50aCgpO1xuXG4gIGlmIChvcHRpb25zLndhdGNoKSB7XG4gICAgLy8gaWYgd2UgYXJlIGluIHdhdGNoIG1vZGUsIHN0YXJ0IHRoZSB3YXRjaCBsb29wXG4gICAgd2F0Y2hMb29wKCk7XG4gIH0gZWxzZSBpZiAoIXN1Y2Nlc3MpIHtcbiAgICAvLyBtYWtlIHN1cmUgZXhpdCBjb2RlIGlzIG5vbi16ZXJvIGlmIHdlIGFyZSBub3QgaW4gd2F0Y2ggbW9kZVxuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIHRyeVN5bnRoKCkge1xuICAgIC8vIGRldGVybWluZSBpZiBwb3N0IHN5bnRoZXNpcyB0YXNrcyBzaG91bGQgYmUgZXhlY3V0ZWQgKGUuZy4gXCJ5YXJuIGluc3RhbGxcIikuXG4gICAgcHJvY2Vzcy5lbnYuUFJPSkVOX0RJU0FCTEVfUE9TVCA9ICghb3B0aW9ucy5wb3N0KS50b1N0cmluZygpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBkZWZhdWx0VGFzayA9IHJ1bnRpbWUudGFza3MuZmluZChcbiAgICAgICAgKHQpID0+IHQubmFtZSA9PT0gUHJvamVjdC5ERUZBVUxUX1RBU0tcbiAgICAgICk7XG5cbiAgICAgIC8vIGlmIFwiLS1yY1wiIGlzIHNwZWNpZmllZCwgaWdub3JlIHRoZSBkZWZhdWx0IHRhc2tcbiAgICAgIGlmIChkZWZhdWx0VGFzaykge1xuICAgICAgICBpZiAoIW9wdGlvbnMucmNmaWxlKSB7XG4gICAgICAgICAgcnVudGltZS5ydW5UYXNrKGRlZmF1bHRUYXNrLm5hbWUpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvZ2dpbmcud2FybihcbiAgICAgICAgICAgIFwiRGVmYXVsdCB0YXNrIHNraXBwZWQuIFRyeWluZyBsZWdhY3kgc3ludGhlc2lzIHNpbmNlIC0tcmMgaXMgc3BlY2lmaWVkXCJcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSwgaWYgdGhlcmUgaXMgYSAucHJvamVucmMuanMgZmlsZSwgZGVmYXVsdCB0byBcIm5vZGUgLnByb2plbnJjLmpzXCJcbiAgICAgIGlmICh0cnlMZWdhY3lTeW50aCgpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBmaW5kIGEgdGFzayBuYW1lZCBcImRlZmF1bHRcIicpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZ2dpbmcuZXJyb3IoYFN5bnRoZXNpcyBmYWlsZWQ6ICR7KGUgYXMgYW55KS5tZXNzYWdlfWApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHdhdGNoTG9vcCgpIHtcbiAgICBsb2dnaW5nLmluZm8oYFdhdGNoaW5nIGZvciBjaGFuZ2VzIGluICR7d29ya2Rpcn0uLi5gKTtcbiAgICBjb25zdCB3YXRjaCA9IGZzLndhdGNoKHdvcmtkaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgIHdhdGNoLm9uKFwiY2hhbmdlXCIsIChldmVudCkgPT4ge1xuICAgICAgLy8gd2Ugb25seSBjYXJlIGFib3V0IFwiY2hhbmdlXCIgZXZlbnRzXG4gICAgICBpZiAoZXZlbnQgIT09IFwiY2hhbmdlXCIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShcIlxceDFCY1wiKTsgLy8gY2xlYXIgc2NyZWVuXG4gICAgICB3YXRjaC5jbG9zZSgpO1xuICAgICAgdHJ5U3ludGgoKVxuICAgICAgICAudGhlbigoKSA9PiB3YXRjaExvb3AoKSlcbiAgICAgICAgLmNhdGNoKCgpID0+IHdhdGNoTG9vcCgpKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyeUxlZ2FjeVN5bnRoKCkge1xuICAgIGNvbnN0IHJjZGlyID0gcGF0aC5kaXJuYW1lKHJjZmlsZSk7XG5cbiAgICBpZiAoIWZzLmV4aXN0c1N5bmMocmNmaWxlKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIGlmIG5vZGVfbW9kdWxlcy9wcm9qZW4gaXMgbm90IGEgZGlyZWN0b3J5IG9yIGRvZXMgbm90IGV4aXN0LCBjcmVhdGUgYVxuICAgIC8vIHRlbXBvcmFyeSBzeW1saW5rIHRvIHRoZSBwcm9qZW4gdGhhdCB3ZSBhcmUgY3VycmVudGx5IHJ1bm5pbmcgaW4gb3JkZXIgdG9cbiAgICAvLyBhbGxvdyAucHJvamVucmMuanMgdG8gYHJlcXVpcmUoKWAgaXQuXG4gICAgY29uc3Qgbm9kZU1vZHVsZXMgPSBwYXRoLnJlc29sdmUocmNkaXIsIFwibm9kZV9tb2R1bGVzXCIpO1xuICAgIGNvbnN0IHByb2plbk1vZHVsZVBhdGggPSBwYXRoLnJlc29sdmUobm9kZU1vZHVsZXMsIFwicHJvamVuXCIpO1xuICAgIGlmIChcbiAgICAgICFmcy5leGlzdHNTeW5jKHBhdGguam9pbihwcm9qZW5Nb2R1bGVQYXRoLCBcInBhY2thZ2UuanNvblwiKSkgfHxcbiAgICAgICFmcy5zdGF0U3luYyhwcm9qZW5Nb2R1bGVQYXRoKS5pc0RpcmVjdG9yeSgpXG4gICAgKSB7XG4gICAgICBmcy5ybVN5bmMocHJvamVuTW9kdWxlUGF0aCwgeyBmb3JjZTogdHJ1ZSwgcmVjdXJzaXZlOiB0cnVlIH0pO1xuICAgICAgZnMubWtkaXJTeW5jKG5vZGVNb2R1bGVzLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbiAgICAgIGZzLnN5bWxpbmtTeW5jKFxuICAgICAgICBwcm9qZW5Nb2R1bGUsXG4gICAgICAgIHByb2plbk1vZHVsZVBhdGgsXG4gICAgICAgIG9zLnBsYXRmb3JtKCkgPT09IFwid2luMzJcIiA/IFwianVuY3Rpb25cIiA6IG51bGxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgcmV0ID0gc3Bhd25TeW5jKHByb2Nlc3MuZXhlY1BhdGgsIFtyY2ZpbGVdLCB7XG4gICAgICBzdGRpbzogW1wiaW5oZXJpdFwiLCBcImluaGVyaXRcIiwgXCJwaXBlXCJdLFxuICAgIH0pO1xuICAgIGlmIChyZXQuZXJyb3IpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgU3ludGhlc2lzIGZhaWxlZDogJHtyZXQuZXJyb3J9YCk7XG4gICAgfSBlbHNlIGlmIChyZXQuc3RhdHVzICE9PSAwKSB7XG4gICAgICBsb2dnaW5nLmVycm9yKHJldC5zdGRlcnIudG9TdHJpbmcoKSk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBTeW50aGVzaXMgZmFpbGVkOiBjYWxsaW5nIFwiJHtwcm9jZXNzLmV4ZWNQYXRofSAke3JjZmlsZX1cIiBleGl0ZWQgd2l0aCBzdGF0dXM9JHtyZXQuc3RhdHVzfWBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdfQ==