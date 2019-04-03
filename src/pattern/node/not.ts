import * as ts from 'typescript';
import { Node } from './node';

export class Not extends Node {
  constructor(readonly node: Node) { super(); }

  match(expr: ts.Expression | undefined, typeChecker: ts.TypeChecker) {
    if (expr === undefined) {
      return false;
    }
    return !this.node.match(expr, typeChecker);
  }
}
