import * as P from 'parsimmon';
import * as ts from 'typescript';
import { scan } from './result';

export function parse(patterns: string[]) {
  const terms = patterns.map((pat, idx) => {
    try {
      return parser.Term.tryParse(pat);
    } catch (e) {
      throw new InvalidPattern(idx, e);
    }
  });
  return new Expression(terms);
}

export class Expression {
  constructor(readonly terms: ReadonlyArray<Term>) {}

  *scan(src: ts.SourceFile) {
    for (const term of this.terms) {
      yield * term.scan(src);
    }
  }
}

class Term {
  constructor(readonly qualifiedIdentifier: QualifiedIdentifier) {}

  *scan(src: ts.SourceFile) {
    for (const node of findNodesByKind(src, ts.SyntaxKind.CallExpression)) {
      if (this.qualifiedIdentifier.match(<ts.CallExpression>node)) {
        yield getRange(src, node);
      }
    }
  }
}

class QualifiedIdentifier {
  constructor(readonly identifiers: ReadonlyArray<Identifier>) {}

  match(node: ts.CallExpression) {
    const q = this.identifiers.map(i => i.name).reduce((acc, s) => `${acc}.${s}`);
    return node.getText().includes(q);
  }
}

class Identifier {
  constructor(readonly name: string) {}
}

const parser = P.createLanguage({

  Term: r => r.QualifiedIdentifier
    .map(qi => new Term(qi)),

  QualifiedIdentifier: r => r.Identifier.sepBy1(P.string('.'))
    .map(is => new QualifiedIdentifier(is)),

  Identifier: _ => P.regex(/[a-zA-Z_-][a-zA-Z0-9_-]*/)
    .map(s => new Identifier(s)),

});

class InvalidPattern extends Error {
  constructor(readonly index: number, readonly error: Error) {
    super();
  }
}

function *findNodesByKind(node: ts.Node, ...kinds: ts.SyntaxKind[]): IterableIterator<ts.Node> {
  if (kinds.some(k => k === node.kind)) {
    yield node;
  }
  for (const n of node.getChildren()) {
    yield * findNodesByKind(n, ...kinds);
  }
}

function getRange(src: ts.SourceFile, node: ts.Node) {
  const begin = src.getLineAndCharacterOfPosition(node.getStart());
  const end = src.getLineAndCharacterOfPosition(node.getEnd());
  return new scan.Range(
    new scan.Position(begin.line + 1, begin.character + 1),
    new scan.Position(end.line + 1, end.character + 1),
  );
}
