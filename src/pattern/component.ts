import * as ts from 'typescript';
import * as utility from './utility';
import { Result } from '../compiler';

export class Expression {

  constructor(readonly terms: ReadonlyArray<Term>) {}

  *scan(result: Result) {
    for (const term of this.terms) {
      yield * term.scan(result);
    }
  }

}

export class Term {

  constructor(readonly identifier: Identifier) {}

  *scan(result: Result): Iterable<ts.Node> {
    const typeChecker = result.program.getTypeChecker();
    const src = result.srcFile;

    for (const node of utility.findNodesByKind(src, ts.SyntaxKind.CallExpression)) {
      if (this.identifier.match(node.getChildAt(0), typeChecker)) {
        yield node;
      }
    }
  }

}

export class Identifier {

  constructor(readonly text: string) {}

  match(node: ts.Node, typeChecker: ts.TypeChecker) {
    const s = utility.getFullQualifiedName(node, typeChecker);
    return s === this.text;
  }

}
