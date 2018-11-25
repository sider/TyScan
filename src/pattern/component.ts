import * as ts from 'typescript';
import * as utility from './utility';

export class Expression {

  constructor(
    readonly terms: ReadonlyArray<Term>,
  ) {}

  *scan(sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker) {
    for (const term of this.terms) {
      yield * term.scan(sourceFile, typeChecker);
    }
  }

}

export class Term {

  constructor(
    readonly identifier: Identifier,
  ) {}

  *scan(sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker): Iterable<ts.Node> {
    for (const node of utility.findNodesByKind(sourceFile, ts.SyntaxKind.CallExpression)) {
      if (this.identifier.match(node.getChildAt(0), typeChecker)) {
        yield node;
      }
    }
  }

}

export class Identifier {

  constructor(
    readonly text: string,
  ) {}

  match(node: ts.Node, typeChecker: ts.TypeChecker) {
    const s = utility.getFullQualifiedName(node, typeChecker);
    return s === this.text;
  }

}
