import * as tsconfig from 'tsconfig';
import * as ts from 'typescript';

const DUMMY_FILE_NAME = '__typescript_code__.ts';

const OPTIONS = ts.convertCompilerOptionsFromJson(
  tsconfig.loadSync('.').config.compilerOptions,
  process.cwd(),
).options;

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
  return new CompileResult(program);
}

export function compileFile(path: string) {
  const program = ts.createProgram([path], OPTIONS);
  return new CompileResult(program);
}

export class CompileError {

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

class CompileResult {

  readonly program: ts.Program;

  readonly errors: ReadonlyArray<CompileError>;

  readonly success: boolean;

  constructor(program: ts.Program) {
    this.program = program;

    const emitResult = program.emit(undefined, () => {});
    const errors = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics)
      .filter(d => d.category === ts.DiagnosticCategory.Error).map(d => new CompileError(d)) ;

    this.errors = errors;
    this.success = this.errors.length === 0;
  }

}
