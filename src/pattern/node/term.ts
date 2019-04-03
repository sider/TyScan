import * as ts from 'typescript';
import { Factor } from './factor';
import { Node } from './node';

export class Term extends Node {
  constructor(readonly factors: ReadonlyArray<Factor>) { super(); }

  match(expr: ts.Expression | undefined, typeChecker: ts.TypeChecker) {
    if (expr === undefined) {
      return false;
    }
    return this.factors.every(f => f.match(expr, typeChecker));
  }
}
