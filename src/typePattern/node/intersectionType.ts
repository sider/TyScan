import * as ts from 'typescript';
import { ArrayType } from './arrayType';
import { Node } from './node';

export class IntersectionType extends Node {
  constructor(readonly arrays: ReadonlyArray<ArrayType>) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
    if (type.isIntersection()) {
      const intersection = <ts.IntersectionType>type;
      return intersection.types.length === this.arrays.length
        && intersection.types.every((t, i) => this.arrays[i].match(t, typeChecker));
    }
    if (this.arrays.length === 1) {
      return this.arrays[0].match(type, typeChecker);
    }
    return false;
  }
}

