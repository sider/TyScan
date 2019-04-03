import * as ts from 'typescript';
import { Node } from './node';

export class ObjectType extends Node {
  constructor(readonly attrs: ReadonlyMap<string, Node>, readonly open: boolean) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
    if (typeChecker.typeToString(type).startsWith('{')) {
      const members = (<any>type).members as Map<string, ts.Symbol>;
      for (const [ak, at] of this.attrs) {
        if (!members.has(ak)) {
          return false;
        }
        const et = (<any>members.get(ak)).type;
        if (!at.match(et, typeChecker)) {
          return false;
        }
      }
      if (this.open && this.attrs.size <= members.size) {
        return true;
      }
      if (!this.open && this.attrs.size === members.size) {
        return true;
      }
    }
    return false;
  }
}
