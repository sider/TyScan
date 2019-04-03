import * as ts from 'typescript';
import { Node } from './node';
import { Node as TypeNode } from '../../typePattern/node';

export class Factor extends Node {
  constructor(readonly node: Node, readonly type: TypeNode | undefined) { super(); }

  match(expr: ts.Expression | undefined, typeChecker: ts.TypeChecker) {
    if (expr === undefined) {
      return false;
    }
    if (this.node.match(expr, typeChecker)) {
      const t = typeChecker.getTypeAtLocation(expr);
      if (this.type === undefined || this.type.match(t, typeChecker)) {
        return true;
      }
    }
    return false;
  }
}
