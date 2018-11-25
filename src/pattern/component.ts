import * as ts from 'typescript';
import * as utility from './utility';

export class Expr {

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
    readonly id: FuncId,
    readonly args: FuncArgs | undefined,
  ) {}

  *scan(sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker): Iterable<ts.Node> {
    for (const node of utility.findNodesByKind(sourceFile, ts.SyntaxKind.CallExpression)) {
      if (this.id.match(node.getChildAt(0), typeChecker)) {
        if (this.args === undefined || this.args.match(node.getChildAt(2), typeChecker)) {
          yield node;
        }
      }
    }
  }

}

export class FuncId {

  constructor(
    readonly text: string,
  ) {}

  match(node: ts.Node, typeChecker: ts.TypeChecker) {
    const s = utility.getFullQualifiedName(node, typeChecker);
    return s.endsWith(this.text);
  }

}

export class FuncArgs {

  constructor(
    readonly typeIds: TypeId[],
  ) {}

  match(node: ts.Node, typeChecker: ts.TypeChecker) {
    if (this.typeIds.length === node.getChildCount()) {
      if (!this.typeIds.some((t, i) => !t.match(node.getChildAt(i), typeChecker))) {
        return true;
      }
    }
    return false;
  }

}

export class TypeId {

  constructor(
    readonly text: string,
  ) {}

  match(node: ts.Node, typeChecker: ts.TypeChecker) {
    return true;
  }

}
