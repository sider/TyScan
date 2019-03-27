import * as tsconfig from 'tsconfig';
import * as ts from 'typescript';

export function compileString(code: string) {
  const host = ts.createCompilerHost(compilerOptions);
  const getSourceFile = host.getSourceFile;
  host.getSourceFile = (fileName: string, langVersion: ts.ScriptTarget) => {
    if (fileName === TEST_FILE_NAME) {
      return ts.createSourceFile(fileName, code, langVersion);
    }
    return getSourceFile(fileName, langVersion);
  };

  const program = ts.createProgram([TEST_FILE_NAME], compilerOptions, host);
  return new Result(program, program.getSourceFile(TEST_FILE_NAME)!);
}

export function compileFiles(paths: string[]) {
  return ts.createProgram(paths, compilerOptions);
}

export function createResult(program: ts.Program, path: string) {
  return new Result(program, program.getSourceFile(path)!);
}

export function configureCompilerOptions(path: string) {
  const json = tsconfig.loadSync(path).config.compilerOptions;
  if (json.jsx === undefined) {
    json.jsx = 'react';
  }
  compilerOptions = ts.convertCompilerOptionsFromJson(json, process.cwd()).options;
}

export class Result {

  constructor(readonly program: ts.Program, readonly srcFile: ts.SourceFile) {}

  isSuccessful() {
    return this.program.getSyntacticDiagnostics(this.srcFile).length === 0;
  }

}

const TEST_FILE_NAME = '__tyscan_test__.tsx';

let compilerOptions = {};
