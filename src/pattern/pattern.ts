import * as ts from 'typescript';
import { Expression } from './node';

export class Pattern {

  constructor(
    readonly expressions: ReadonlyArray<Expression>,
  ) {}

  *scan(srcFile: ts.SourceFile, typeChecker: ts.TypeChecker) {
    for (const expr of findTargets(srcFile)) {
      if (this.expressions.some(e => e.match(expr, typeChecker))) {
        yield expr;
      }
    }
  }

}

function *findTargets(node: ts.Node): IterableIterator<ts.Expression> {
  if ((<any>ts).isExpressionNode(node)) {
    yield <ts.Expression>node;
  }

  for (const n of node.getChildren()) {
    yield * findTargets(n);
  }
}
