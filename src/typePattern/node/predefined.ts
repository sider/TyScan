import * as ts from 'typescript';
import { Node } from './node';


export class Predefined extends Node {
  constructor(readonly text: string) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
    if (type.flags & ts.TypeFlags.Any) {
      return this.text === 'any';
    }
    if (type.flags & ts.TypeFlags.NumberLike) {
      return this.text === 'number';
    }
    if (type.flags & ts.TypeFlags.StringLike) {
      return this.text === 'string';
    }
    if (type.flags & ts.TypeFlags.BooleanLike) {
      return this.text === 'boolean';
    }
    if (type.flags & ts.TypeFlags.VoidLike) {
      return this.text === 'void';
    }
    return false;
  }
}
