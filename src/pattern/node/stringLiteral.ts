import * as ts from 'typescript';
import { Node } from './node';

export class StringLiteral extends Node {
  constructor(readonly value: string) { super(); }

  match(expr: ts.Expression | undefined, typeChecker: ts.TypeChecker) {
    if (expr === undefined) {
      return false;
    }
    if (ts.isStringLiteral(expr)) {
      return expr.text === this.value;
    }
    return false;
  }
}
