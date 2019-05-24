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
    return matchArgs(this.args, exprs, typeChecker);
  }
}

const ELLIPSIS = 'ELLIPSIS';

function matchArgs(
  patternNodes: ReadonlyArray<Node|undefined>,
  typescriptNodes: ReadonlyArray<ts.Expression>,
  typeChecker: ts.TypeChecker): boolean {

  const pattern0 = getPatternNodeAt(patternNodes, 0);
  const typescript0 = getTypeScriptNodeAt(typescriptNodes, 0);

  if (pattern0 === undefined) {
    return typescript0 === undefined;
  }

  if (typescript0 === undefined) {
    return pattern0 === ELLIPSIS && getPatternNodeAt(patternNodes, 1) === undefined;
  }

  if (pattern0 === ELLIPSIS) {
    const pattern1 = getPatternNodeAt(patternNodes, 1) as Node;
    if (pattern1 === undefined) {
      return true;
    }
    if (pattern1.match(typescript0, typeChecker)) {
      return matchArgs(patternNodes.slice(2), typescriptNodes.slice(1), typeChecker);
    }
    return matchArgs(patternNodes, typescriptNodes.slice(1), typeChecker);
  }

  return pattern0.match(typescript0, typeChecker)
    && matchArgs(patternNodes.slice(1), typescriptNodes.slice(1), typeChecker);
}

function getPatternNodeAt(nodes: ReadonlyArray<Node|undefined>, i: 0 | 1) {
  if (i === 0) {
    return 0 < nodes.length ? getPatternNodeOrEllipsis(nodes, 0) : undefined;
  }
  return 1 < nodes.length ? getPatternNodeOrEllipsis(nodes, 1) : undefined;
}

function getPatternNodeOrEllipsis(nodes: ReadonlyArray<Node|undefined>, i: 0 | 1) {
  const n = nodes[i];
  return n === undefined ? ELLIPSIS : n;
}

function getTypeScriptNodeAt(nodes: ReadonlyArray<ts.Expression>, i: 0 | 1) {
  if (i === 0) {
    return 0 < nodes.length ? nodes[0] : undefined;
  }
  return 1 < nodes.length ? nodes[1] : undefined;
}
