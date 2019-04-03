import * as ts from 'typescript';
import { Node } from './node';


export class FunctionType extends Node {
  constructor(readonly args: ReadonlyArray<Node>, readonly ret: Node) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
    const node = typeChecker.typeToTypeNode(type);
    if (node !== undefined && node.kind & ts.SyntaxKind.FunctionType) {
      const sig = type.getCallSignatures()[0];
      return sig !== undefined
        && this.args.length === sig.parameters.length
        && this.args.every((a, i) => {
          const t = typeChecker.getTypeAtLocation(sig.parameters[i].declarations[0]);
          return a.match(t, typeChecker);
        })
        && this.ret.match(sig.getReturnType(), typeChecker);
    }
    return false;
  }
}
