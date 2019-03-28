import * as ts from 'typescript';

export class SourceFile {

  readonly path: string;

  readonly sourceFile: ts.SourceFile;

  readonly typeChecker: ts.TypeChecker;

  private readonly program: ts.Program;

  constructor(path: string, program: ts.Program) {
    this.path = path;
    this.program = program;
    this.sourceFile = program.getSourceFile(path)!;
    this.typeChecker = program.getTypeChecker();
  }

  isSuccessfullyParsed() {
    return this.getSyntacticDiagnostics().length === 0;
  }

  getSyntacticDiagnostics() {
    return this.program.getSyntacticDiagnostics(this.sourceFile);
  }
}
