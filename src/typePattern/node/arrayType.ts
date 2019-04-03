import * as ts from 'typescript';
import { Node } from './node';

export class ArrayType extends Node {
  constructor(readonly node: Node, readonly dimension: number) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
    const typeNode = typeChecker.typeToTypeNode(type);
    if (typeNode === undefined) {
      return false;
    }

    if (typeNode.kind === ts.SyntaxKind.ArrayType) {
      if (0 < this.dimension) {
        const t = (<any>type).typeArguments[0] as ts.Type;
        return this.node.match(t, typeChecker);
      }
      return false;
    }
    return this.dimension === 0 ? this.node.match(type, typeChecker) : false;
  }
}
