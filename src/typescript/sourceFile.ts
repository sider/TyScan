import * as ts from 'typescript';

export class SourceFile {

  readonly path: string;

  private program: ts.Program;

  private sourceFile?: ts.SourceFile;

  private typeChecker?: ts.TypeChecker;

  constructor(path: string, program: ts.Program) {
    this.path = path;
    this.program = program;
    this.sourceFile = program.getSourceFile(path)!;
    this.typeChecker = program.getTypeChecker();
  }

  getSourceFile() {
    if (this.sourceFile === undefined) {
      this.sourceFile = this.program.getSourceFile(this.path)!;
    }
    return this.sourceFile!;
  }

  getTypeChecker() {
    if (this.typeChecker === undefined) {
      this.typeChecker = this.program.getTypeChecker();
    }
    return this.typeChecker!;
  }

  isSuccessfullyParsed() {
    return this.getSyntacticDiagnostics().length === 0;
  }

  getSyntacticDiagnostics() {
    return this.program.getSyntacticDiagnostics(this.sourceFile);
  }

  getExpressions() {
    return SourceFile.getExperssionsInNode(this.getSourceFile());
  }

  getLineAndCharacter(position: number) {
    return ts.getLineAndCharacterOfPosition(this.getSourceFile(), position);
  }

  private static *getExperssionsInNode(node: ts.Node): IterableIterator<ts.Expression> {
    if (SourceFile.isExpressionNode(node)) {
      yield <ts.Expression>node;
    }
    for (const n of node.getChildren()) {
      yield * SourceFile.getExperssionsInNode(n);
    }
  }

  private static isExpressionNode(node: ts.Node): boolean {
    return (<any>ts).isExpressionNode(node);
  }
}
