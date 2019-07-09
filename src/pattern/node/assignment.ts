import * as ts from 'typescript';
import { Node } from './node';
import { Element } from "./element"

// x.y = _
export class Assignment extends Node {
  constructor(readonly lhs: Element, readonly rhs: Node) { super(); }

  match(expr: ts.Expression | undefined, typeChecker: ts.TypeChecker) {
    if (expr === undefined) {
      return false;
    }

    if (ts.isBinaryExpression(expr) && expr.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      return this.lhs.match(expr.left, typeChecker) &&
        this.rhs.match(expr.right, typeChecker);
    }

    return false;
  }
}
