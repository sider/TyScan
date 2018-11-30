import * as ts from 'typescript';
import { Expression } from './node';

export class Pattern {

  constructor(
    readonly expressions: ReadonlyArray<Expression>,
  ) {}

  *scan(srcFile: ts.SourceFile, typeChecker: ts.TypeChecker) {
    for (const t of findTargets(srcFile)) {
      if (this.expressions.some(e => e.match(t, typeChecker))) {
        yield t;
      }
    }
  }

}

function *findTargets(node: ts.Node): IterableIterator<ts.Expression> {
  if (isExpressionNode(node)) {
    yield <ts.Expression>node;
  }

  for (const n of node.getChildren()) {
    yield * findTargets(n);
  }
}

// Internal API
const isExpressionNode = (<any>ts).isExpressionNode as (_: ts.Node) => boolean;
