import * as ts from 'typescript';
import { Node } from './node';

export class TupleType extends Node {
  constructor(readonly types: ReadonlyArray<Node>) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
    if (typeChecker.typeToTypeNode(type)!.kind & ts.SyntaxKind.TupleType) {
      const args = (<any>type).typeArguments as ts.Type[];
      return args !== undefined
        && args.length === this.types.length
        && args.every((a, i) => this.types[i].match(a, typeChecker));
    }
    return false;
  }
}
