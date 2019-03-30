import * as ts from 'typescript';

export class SourceFile {

  readonly path: string;

  private readonly sourceFile: ts.SourceFile;

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

  getExpressions() {
    return findExperssions(this.sourceFile);
  }

  getLineAndCharacter(position: number) {
    return ts.getLineAndCharacterOfPosition(this.sourceFile, position);
  }
}

function *findExperssions(node: ts.Node): IterableIterator<ts.Expression> {
  if (isExpressionNode(node)) {
    yield <ts.Expression>node;
  }

  for (const n of node.getChildren()) {
    yield * findExperssions(n);
  }
}

// Internal API
const isExpressionNode = (<any>ts).isExpressionNode as (_: ts.Node) => boolean;
