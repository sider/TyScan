import * as ts from 'typescript';
import { TopLevelType } from './type/node';

abstract class Node {
  abstract match(expr: ts.Expression, typeChecker: ts.TypeChecker): boolean;
}

export class Expression extends Node {
  constructor(readonly terms: ReadonlyArray<Term>) { super(); }

  match(expr: ts.Expression, typeChecker: ts.TypeChecker) {
    return this.terms.some(t => t.match(expr, typeChecker));
  }
}

export class Term extends Node {
  constructor(readonly factors: ReadonlyArray<Factor>) { super(); }

  match(expr: ts.Expression, typeChecker: ts.TypeChecker) {
    return this.factors.every(f => f.match(expr, typeChecker));
  }
}

export class Factor extends Node {
  constructor(readonly node: Node, readonly type: TopLevelType | undefined) { super(); }

  match(expr: ts.Expression, typeChecker: ts.TypeChecker) {
    if (this.node.match(expr, typeChecker)) {
      const t = typeChecker.getTypeAtLocation(expr);
      if (this.type === undefined || this.type.match(t, typeChecker)) {
        return true;
      }
    }
    return false;
  }
}

export class Not extends Node {
  constructor(readonly node: Node) { super(); }

  match(expr: ts.Expression, typeChecker: ts.TypeChecker) {
    return !this.node.match(expr, typeChecker);
  }
}

export class Wildcard extends Node {
  match(_: ts.Expression, __: ts.TypeChecker) {
    return true;
  }
}
