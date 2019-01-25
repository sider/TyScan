"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsconfig = require("tsconfig");
const ts = require("typescript");
function compileString(code) {
    const host = ts.createCompilerHost(OPTIONS);
    const getSourceFile = host.getSourceFile;
    host.getSourceFile = (fileName, langVersion) => {
        if (fileName === TEST_FILE_NAME) {
            return ts.createSourceFile(fileName, code, langVersion);
        }
        return getSourceFile(fileName, langVersion);
    };
    const program = ts.createProgram([TEST_FILE_NAME], OPTIONS, host);
    return new Result(program, program.getSourceFile(TEST_FILE_NAME));
}
exports.compileString = compileString;
function compileFile(path) {
    const program = ts.createProgram([path], OPTIONS);
    return new Result(program, program.getSourceFile(path));
}
exports.compileFile = compileFile;
class Result {
    constructor(program, srcFile) {
        this.program = program;
        this.srcFile = srcFile;
    }
    isSuccessful() {
        return this.program.getSyntacticDiagnostics(this.srcFile).length === 0;
    }
}
exports.Result = Result;
const TEST_FILE_NAME = '__tyscan_test__.ts';
const OPTIONS = ts.convertCompilerOptionsFromJson(tsconfig.loadSync('.').config.compilerOptions, process.cwd()).options;
//# sourceMappingURL=compiler.js.map