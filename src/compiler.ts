import * as tsconfig from 'tsconfig';
import * as ts from 'typescript';

const DUMMY_FILE_NAME = '__typescript_code__.ts';

const OPTIONS = tsconfig.loadSync('.').config.compilerOptions || {};

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
  return new Compilation(program);
}

export function compileFile(path: string) {
  const program = ts.createProgram([path], OPTIONS);
  return new Compilation(program);
}

export class Diagnostic {

  readonly file: string | undefined;

  readonly line: number | undefined;

  readonly char: number | undefined;

  readonly message: string;

  constructor(diagnostic: ts.Diagnostic) {
    this.message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');

    if (diagnostic.file) {
      const lineChar = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
      this.file = diagnostic.file.fileName;
      this.line = lineChar.line + 1;
      this.char = lineChar.character + 1;
    }
  }

}

class Compilation {

  readonly program: ts.Program;

  readonly preEmitDiagnostics: ReadonlyArray<Diagnostic>;

  readonly postEmitDiagnostics: ReadonlyArray<Diagnostic>;

  readonly success: boolean;

  constructor(program: ts.Program) {
    const emitResult = program.emit(undefined, () => {});

    this.program = program;
    this.preEmitDiagnostics = ts.getPreEmitDiagnostics(program).map(d => new Diagnostic(d));
    this.postEmitDiagnostics = emitResult.diagnostics.map(d => new Diagnostic(d));
    this.success = !emitResult.emitSkipped;
  }

}
