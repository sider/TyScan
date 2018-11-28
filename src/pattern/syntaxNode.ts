import * as ts from 'typescript';
import * as typeNode from './typeNode';

abstract class Node {
  abstract match(node: ts.Expression, typeChecker: ts.TypeChecker): boolean;
}

export class Expression extends Node {
  constructor(readonly terms: ReadonlyArray<Term>) { super(); }

  match(node: ts.Expression, typeChecker: ts.TypeChecker) {
    return this.terms.some(t => t.match(node, typeChecker));
  }
}

export class Term extends Node {
  constructor(readonly factors: ReadonlyArray<Factor>) { super(); }

  match(node: ts.Expression, typeChecker: ts.TypeChecker) {
    return this.factors.every(f => f.match(node, typeChecker));
  }
}

export abstract class Factor extends Node {
}

export class NotFactor extends Factor {
  constructor(readonly factor: Factor) { super(); }

  match(node: ts.Expression, typeChecker: ts.TypeChecker) {
    return !this.factor.match(node, typeChecker);
  }
}

export class ParenedExpression extends Factor {
  constructor(readonly expression: Expression) { super(); }

  match(node: ts.Expression, typeChecker: ts.TypeChecker) {
    return this.expression.match(node, typeChecker);
  }
}

export class Wildcard extends Factor {
  constructor(readonly type: typeNode.UnionType | undefined) { super(); }

  match(expr: ts.Expression, typeChecker: ts.TypeChecker) {
    if (this.type === undefined) {
      return true;
    }
    const type = typeChecker.getTypeAtLocation(expr);
    return this.type.match(type, typeChecker);
  }
}

export class Null extends Factor {
  match(expr: ts.Expression, _: ts.TypeChecker) {
    if (expr.kind === ts.SyntaxKind.NullKeyword) {
      if (!(<any>ts).isExpression(expr.parent)) {
        return true;
      }
    }
    return false;
  }
}

export class Undefined extends Factor {
  match(expr: ts.Expression, _: ts.TypeChecker) {
    if (expr.kind === ts.SyntaxKind.Identifier) {
      const id = <ts.Identifier>expr;
      if (id.originalKeywordKind && id.originalKeywordKind === ts.SyntaxKind.UndefinedKeyword) {
        return true;
      }
    }
    return false;
  }
}
