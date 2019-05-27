import * as ts from 'typescript';
import { Node, ELLIPSIS } from './node';
import { Element } from './element';

export class Call extends Node {
  constructor(readonly elem: Element, readonly args: ReadonlyArray<Node|(typeof ELLIPSIS)>) {
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

// Match pattern node sequence with typescript node sequence from head, recursively.
function matchArgs(
  patternNodes: ReadonlyArray<Node|(typeof ELLIPSIS)>,
  typescriptNodes: ReadonlyArray<ts.Expression>,
  typeChecker: ts.TypeChecker): boolean {

  const fstPattern = patternNodes[0];
  const fstTypeScript = typescriptNodes[0];

  // Check if all pattern nodes have been consumed or not
  if (fstPattern === undefined) {
    // Match if all typescriot nodes have also been consumed
    return fstTypeScript === undefined;
  }

  // ↓ There remains a pattern node ↓

  // Check if all typescript nodes have been consumed or not
  if (fstTypeScript === undefined) {
    // If all typescript nodes have already been consumed,
    // then the 1st pattern node sequence should be `...`
    // and the 2nd pattern node should not exist.
    return fstPattern === ELLIPSIS && patternNodes[1] === undefined;
  }

  // ↓ There remains a pattern node & a type script node ↓

  // Check if the 1st pattern node is `...` or not
  if (fstPattern === ELLIPSIS) {
    // Check if the pattern node sequence contains an element after `...`
    const nextPattern = patternNodes[1] as Node; // Can cast as `Node`
                                                 // since (..., ...) is not accepted when parsing
    if (nextPattern === undefined) {
      return true;
    }

    // Consume two pattern nodes and one typescript node
    // if the 2nd pattern matches the 1st typescript node
    if (nextPattern.match(fstTypeScript, typeChecker)) {
      return matchArgs(patternNodes.slice(2), typescriptNodes.slice(1), typeChecker);
    }

    // Consume only one typescript node if the 2nd pattern does not match the 1st typescript node
    // (No pattern node is consumed.)
    return matchArgs(patternNodes, typescriptNodes.slice(1), typeChecker);
  }

  // ↓ The 1st patter node is not `...` ↓

  // the 1st pattern node should match the 1st typescript node,
  // and the rest of both sequence should match recursively.
  return fstPattern.match(fstTypeScript, typeChecker)
    && matchArgs(patternNodes.slice(1), typescriptNodes.slice(1), typeChecker);
}
