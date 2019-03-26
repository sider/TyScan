import * as ts from 'typescript';
import { Node as TypeNode } from './type/node';

abstract class Node {
  abstract match(expr: ts.Expression, typeChecker: ts.TypeChecker): boolean;
}

export class Jsx extends Node {
  constructor(
    readonly name: string,
    readonly attrs: ReadonlyMap<[string, boolean], JsxAttrValue>) { super(); }

  match(expr: ts.Expression, typeChecker: ts.TypeChecker) {
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
          if (props.has(name)) {
            if (!val.match(positive, props.get(name), typeChecker)) {
              return false;
            }
          } else {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }
}

export class JsxAttrValue {
  constructor(readonly node: Node) {}

  match(positive: boolean, attr: ts.JsxAttributeLike | undefined, typeChecker: ts.TypeChecker) {
    if (attr === undefined) {
      return positive;
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

//          pos T    pos F
// match T   T        F
// match F   F        T

export class Expression extends Node {
  constructor(readonly terms: ReadonlyArray<Term>) { super(); }

  match(expr: ts.Expression, typeChecker: ts.TypeChecker) {
    return this.terms.some(t => t.match(expr, typeChecker));
  }
}

export class Term extends Node {
  constructor(readonly factors: ReadonlyArray<Factor>) { super(); }

  match(expr: ts.Expression, typeChecker: ts.TypeChecker) {
    return this.factors.every(f => f.match(expr, typeChecker));
  }
}

export class Factor extends Node {
  constructor(readonly node: Node, readonly type: TypeNode | undefined) { super(); }

  match(expr: ts.Expression, typeChecker: ts.TypeChecker) {
    if (this.node.match(expr, typeChecker)) {
      const t = typeChecker.getTypeAtLocation(expr);
      if (this.type === undefined || this.type.match(t, typeChecker)) {
        return true;
      }
    }
    return false;
  }
}

export class StringLiteral extends Node {
  constructor(readonly value: string) { super(); }

  match(expr: ts.Expression, typeChecker: ts.TypeChecker) {
    if (ts.isStringLiteral(expr)) {
      return expr.text === this.value;
    }
    return false;
  }
}

export class Element extends Node {
  constructor(readonly receiver: Node | undefined, readonly atom: Node) { super(); }

  match(expr: ts.Expression, typeChecker: ts.TypeChecker) {
    if (this.receiver === undefined) {
      return this.atom.match(expr, typeChecker);
    }
    if (ts.isPropertyAccessExpression(expr)) {
      return this.atom.match(expr.name, typeChecker)
        && this.receiver.match(expr.expression, typeChecker);
    }
    return false;
  }
}

export class Not extends Node {
  constructor(readonly node: Node) { super(); }

  match(expr: ts.Expression, typeChecker: ts.TypeChecker) {
    return !this.node.match(expr, typeChecker);
  }
}

export class Wildcard extends Node {
  match(_: ts.Expression, __: ts.TypeChecker) {
    return true;
  }
}

export class Identifier extends Node {
  constructor(readonly name: string) { super(); }

  match(expr: ts.Expression, typeChecker: ts.TypeChecker) {
    if (ts.isIdentifier(expr)) {
      return expr.escapedText === this.name;
    }
    return false;
  }
}

export class Call extends Node {
  constructor(readonly elem: Element, readonly args: ReadonlyArray<Node|undefined>) { super(); }

  match(expr: ts.Expression, typeChecker: ts.TypeChecker) {
    if (ts.isCallExpression(expr)) {
      const ce = <ts.CallExpression>expr;
      return this.elem.match(ce.expression, typeChecker)
        && this.matchArgs(ce.arguments, typeChecker);
    }
    return false;
  }

  matchArgs(exprs: ts.NodeArray<ts.Expression>, typeChecker: ts.TypeChecker) {
    if (this.args.every(a => a !== undefined)) {
      return this.args.length === exprs.length
        && this.args.every((a, i) => a!.match(exprs[i], typeChecker));
    }

    let [argIdx, exprIdx] = [0, 0];
    while (argIdx < this.args.length && exprIdx < exprs.length) {
      const a = this.args[argIdx];
      const e = exprs[exprIdx];

      if (a === undefined) {
        if (argIdx === this.args.length - 1) {
          return true;
        }

        const aNext = this.args[argIdx + 1]!;
        if (aNext.match(e, typeChecker)) {
          argIdx += 2;
        }
        exprIdx += 1;

      } else {
        if (a.match(e, typeChecker)) {
          argIdx += 1;
          exprIdx += 1;

        } else {
          return false;
        }
      }
    }

    if (exprIdx === 0) {
      return exprIdx === exprs.length;
    }
    return argIdx === this.args.length && exprIdx === exprs.length;
  }
}
