import * as ts from 'typescript';
import { Node } from './node';

export class JsxAttrValue {
  constructor(readonly node: Node) {}

  match(positive: boolean, attr: ts.JsxAttributeLike | undefined, typeChecker: ts.TypeChecker) {
    if (attr === undefined) {
      return this.node.match(attr, typeChecker) === positive;
    }
    if (attr.kind === ts.SyntaxKind.JsxSpreadAttribute) {
      return false;
    }
    if (attr.initializer === undefined) {
      return false;
    }
    if (attr.initializer.kind === ts.SyntaxKind.StringLiteral) {
      return this.node.match(attr.initializer, typeChecker) === positive;
    }
    if (attr.initializer.expression === undefined) {
      return false;
    }
    return this.node.match(attr.initializer.expression, typeChecker) === positive;
  }
}
