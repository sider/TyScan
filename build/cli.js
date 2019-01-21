"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fg = require("fast-glob");
const fs = require("fs");
const ts = require("typescript");
const config = require("./config");
function scan(srcPaths, configPath, jsonOutput) {
    const paths = srcPaths
        .filter(p => fs.existsSync(p))
        .map(p => p.replace(/\/$/, ''))
        .map(p => fs.statSync(p).isDirectory() ? fg.sync(`${p}/**/*.ts`).map(e => e.toString()) : [p])
        .reduce((acc, paths) => acc.concat(paths), []);
    const output = { matches: [], errors: [] };
    const ecode = 0;
    for (const result of config.load(configPath).scan(paths)) {
        const src = result.compileResult.srcFile;
        if (result.nodes !== undefined) {
            for (const [rule, nodes] of result.nodes) {
                for (const node of nodes) {
                    const start = ts.getLineAndCharacterOfPosition(src, node.getStart());
                    if (jsonOutput) {
                        const end = ts.getLineAndCharacterOfPosition(src, node.end);
                        output.matches.push({
                            rule: { id: rule.id, message: rule.message },
                            path: result.path,
                            location: {
                                start: [start.line + 1, start.character + 1],
                                end: [end.line + 1, end.character + 1],
                            },
                        });
                    }
                    else {
                        const loc = `${result.path}#L${start.line + 1}C${start.character + 1}`;
                        const msg = `${rule.message} (${rule.id})`;
                        console.log(`${loc}\t${node.getText()}\t${msg}`);
                    }
                }
            }
        }
        else {
            const diags = result.compileResult.program.getSyntacticDiagnostics(src);
            for (const diag of diags) {
                const start = ts.getLineAndCharacterOfPosition(src, diag.start);
                const msg = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
                if (jsonOutput) {
                    output.errors.push({
                        location: [start.line + 1, start.character + 1],
                        message: msg,
                    });
                }
                else {
                    console.error(`${result.path}#L${start.line + 1}C${start.character + 1}: ${msg}`);
                }
            }
        }
    }
    if (jsonOutput) {
        console.log(JSON.stringify(output));
    }
    return ecode;
}
exports.scan = scan;
function test(configPath) {
    const count = { success: 0, failure: 0, skipped: 0 };
    for (const result of config.load(configPath).test()) {
        const testId = `#${result.test.index + 1} in ${result.test.rule.id}`;
        if (result.success === true) {
            count.success += 1;
        }
        else if (result.success === false) {
            count.failure += 1;
            if (result.test.match) {
                console.log(`No match found in match test ${testId}`);
            }
            else {
                console.log(`Match found in unmatch test ${testId}`);
            }
        }
        else {
            count.skipped += 1;
            const kind = result.test.match ? 'match' : 'unmatch';
            console.log(`Skipped ${kind} test ${testId}`);
        }
    }
    console.log('Summary:');
    console.log(` - Success: ${count.success} test(s)`);
    console.log(` - Failure: ${count.failure} test(s)`);
    console.log(` - Skipped: ${count.skipped} test(s)`);
    return (count.failure + count.skipped) ? 1 : 0;
}
exports.test = test;
//# sourceMappingURL=cli.js.map