import * as ts from 'typescript';
import { Module } from './module';
import { Node } from './node';

export class Reference extends Node {
  constructor(
    readonly module: Module,
    readonly name: string,
    readonly args: ReadonlyArray<Node>,
  ) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
    const node = typeChecker.typeToTypeNode(type);
    if (node === undefined) {
      return false;
    }

    const name = (<any>node).typeName;
    if (name === undefined) {
      return false;
    }

    const decl = type.symbol.valueDeclaration;
    return this.module.match(decl) && this.name === (<ts.Identifier>name).escapedText;
  }
}
