import * as ts from 'typescript';
import { Node } from './node';
import { Term } from './term';

export class Expression extends Node {
  constructor(readonly terms: ReadonlyArray<Term>) { super(); }

  match(expr: ts.Expression | undefined, typeChecker: ts.TypeChecker) {
    if (expr === undefined) {
      return false;
    }
    return this.terms.some(t => t.match(expr, typeChecker));
  }
}
