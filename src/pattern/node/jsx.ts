import * as ts from 'typescript';
import { Node } from './node';
import { JsxAttrValue } from './jsxAttrValue';

export class Jsx extends Node {
  constructor(
    readonly name: string,
    readonly attrs: ReadonlyMap<[string, boolean], JsxAttrValue | undefined>) { super(); }

  match(expr: ts.Expression | undefined, typeChecker: ts.TypeChecker) {
    if (expr === undefined) {
      return false;
    }
    if (expr.kind === ts.SyntaxKind.JsxElement) {
      const openingElement = (<ts.JsxElement>expr).openingElement;
      const name = openingElement.tagName.getText();
      if (name === this.name) {
        const props = new Map<string, ts.JsxAttributeLike>();
        for (const attr of openingElement.attributes.properties) {
          if (attr.name !== undefined) {
            props.set(attr.name.getText(), attr);
          }
        }

        for (const [[name, positive], val] of this.attrs) {
          if (val === undefined) { // Scanning non existence
            if (props.has(name)) {
              return false;
            }
          } else {
            if (!val.match(positive, props.get(name), typeChecker)) {
              return false;
            }
          }
        }
        return true;
      }
    }
    return false;
  }
}
