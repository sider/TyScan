import * as tsconfig from 'tsconfig';
import * as ts from 'typescript';

export function compileString(code: string) {
  const host = ts.createCompilerHost(OPTIONS);

  const getSourceFile = host.getSourceFile;
  host.getSourceFile = (fileName: string, langVersion: ts.ScriptTarget) => {
    if (fileName === DUMMY_FILE_NAME) {
      return ts.createSourceFile(fileName, code, langVersion);
    }
    return getSourceFile(fileName, langVersion);
  };

  const program = ts.createProgram([DUMMY_FILE_NAME], OPTIONS, host);
  return new Result(program, program.getSourceFile(DUMMY_FILE_NAME)!);
}

export function compileFile(path: string) {
  const program = ts.createProgram([path], OPTIONS);
  return new Result(program, program.getSourceFile(path)!);
}

export class Result {

  constructor(
    readonly program: ts.Program,
    readonly mainSrc: ts.SourceFile,
  ) {}

  isSuccessful() {
    return this.program.getSyntacticDiagnostics(this.mainSrc).length === 0;
  }

}

const DUMMY_FILE_NAME = '__typescript_code__.ts';

const OPTIONS = ts.convertCompilerOptionsFromJson(
  tsconfig.loadSync('.').config.compilerOptions,
  process.cwd(),
).options;
