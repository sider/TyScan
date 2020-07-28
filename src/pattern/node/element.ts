import * as ts from 'typescript';
import { Node } from './node';

export class Element extends Node {
  constructor(readonly receiver: Node | undefined, readonly atom: Node) {
    super();
  }

  match(expr: ts.Expression | undefined, typeChecker: ts.TypeChecker) {
    if (expr === undefined) {
      return false;
    }
    if (this.receiver === undefined) {
      return this.atom.match(expr, typeChecker);
    }
    if (ts.isPropertyAccessExpression(expr)) {
      return (
        this.atom.match(expr.name, typeChecker) && this.receiver.match(expr.expression, typeChecker)
      );
    }
    return false;
  }
}
