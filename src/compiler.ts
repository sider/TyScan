import * as tsconfig from 'tsconfig';
import * as ts from 'typescript';

export const DUMMY_FILE_NAME = '__typescript_code__.ts';

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

export class CompileErrors {

  constructor(
    readonly preEmitSyntacticErrors: ReadonlyArray<ts.Diagnostic>,
    readonly preEmitSemanticErrors: ReadonlyArray<ts.Diagnostic>,
    readonly preEmitGlobalErrors: ReadonlyArray<ts.Diagnostic>,
    readonly postEmitErrors: ReadonlyArray<ts.Diagnostic>,
    ) {}

}

class CompileResult {

  readonly program: ts.Program;

  readonly errors: CompileErrors;

  readonly success: boolean;

  constructor(program: ts.Program) {
    this.program = program;

    this.errors = new CompileErrors(
      program.getSyntacticDiagnostics(),
      program.getSemanticDiagnostics(),
      program.getGlobalDiagnostics(),
      program.emit(undefined, () => {}).diagnostics,
    );

    this.success = this.errors.preEmitSyntacticErrors.length === 0;
  }

}

const OPTIONS = ts.convertCompilerOptionsFromJson(
  tsconfig.loadSync('.').config.compilerOptions,
  process.cwd(),
).options;
