import * as tsconfig from 'tsconfig';
import * as ts from 'typescript';

export function compileString(code: string) {
  const host = ts.createCompilerHost(OPTIONS);
  const getSourceFile = host.getSourceFile;
  host.getSourceFile = (fileName: string, langVersion: ts.ScriptTarget) => {
    if (fileName === TEST_FILE_NAME) {
      return ts.createSourceFile(fileName, code, langVersion);
    }
    return getSourceFile(fileName, langVersion);
  };

  const program = ts.createProgram([TEST_FILE_NAME], OPTIONS, host);
  return new Result(program, program.getSourceFile(TEST_FILE_NAME)!);
}

export function compileFile(path: string) {
  const program = ts.createProgram([path], OPTIONS);
  return new Result(program, program.getSourceFile(path)!);
}

export class Result {

  constructor(readonly program: ts.Program, readonly srcFile: ts.SourceFile) {}

  isSuccessful() {
    return this.program.getSyntacticDiagnostics(this.srcFile).length === 0;
  }

}

const TEST_FILE_NAME = '__tyscan_test__.ts';

const OPTIONS = ts.convertCompilerOptionsFromJson(
  tsconfig.loadSync('.').config.compilerOptions,
  process.cwd(),
).options;
