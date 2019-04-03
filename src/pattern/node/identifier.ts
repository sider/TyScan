import * as ts from 'typescript';
import { Node } from './node';

export class Identifier extends Node {
  constructor(readonly name: string) { super(); }

  match(expr: ts.Expression, typeChecker: ts.TypeChecker) {
    if (expr === undefined) {
      return false;
    }
    if (ts.isIdentifier(expr)) {
      return expr.escapedText === this.name;
    }
    return false;
  }
}
