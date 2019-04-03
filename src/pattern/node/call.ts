import * as ts from 'typescript';
import { Node } from './node';
import { Element } from './element';

export class Call extends Node {
  constructor(readonly elem: Element, readonly args: ReadonlyArray<Node|undefined>) {
    super();
  }

  match(expr: ts.Expression, typeChecker: ts.TypeChecker) {
    if (expr === undefined) {
      return false;
    }
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
