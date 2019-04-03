import * as ts from 'typescript';
import { Node } from './node';
import { IntersectionType } from './intersectionType';

export class UnionType extends Node {
  constructor(readonly intersections: ReadonlyArray<IntersectionType>) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
    if (type.isUnion()) {
      const union = <ts.UnionType>type;
      return union.types.length === this.intersections.length
        && union.types.every((t, i) => this.intersections[i].match(t, typeChecker));
    }
    if (this.intersections.length === 1) {
      return this.intersections[0].match(type, typeChecker);
    }
    return false;
  }
}
