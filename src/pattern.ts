import * as P from 'parsimmon';
import * as ts from 'typescript';
import { Result as CompileResult } from './compiler';

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

  *scan(result: CompileResult) {
    for (const term of this.terms) {
      yield * term.scan(result);
    }
  }

}

class Term {

  constructor(readonly identifier: Identifier) {}

  *scan(result: CompileResult): Iterable<ts.Node> {
    const typeChecker = result.program.getTypeChecker();
    const src = result.srcFile;

    for (const node of findNodesByKind(src, ts.SyntaxKind.CallExpression)) {
      if (this.identifier.match(node.getChildAt(0), typeChecker)) {
        yield node;
      }
    }
  }

}

class Identifier {

  constructor(readonly text: string) {}

  match(node: ts.Node, typeChecker: ts.TypeChecker) {
    const s = getFullQualifiedName(node, typeChecker);
    return s === this.text;
  }

}

const parser = P.createLanguage({

  Term: r => r.Identifier.map(qi => new Term(qi)),

  Identifier: _ => P.regex(/[\/\.a-zA-Z0-9_-]+/).map(s => new Identifier(s)),

});

class InvalidPattern extends Error {

  constructor(readonly index: number, readonly error: Error) {
    super();
  }

}

function getFullQualifiedName(node: ts.Node, typeChecker: ts.TypeChecker) {
  const ids = Array.from(findNodesByKind(node, ts.SyntaxKind.Identifier));
  const idStrs = ids.map(i => i.getText());

  const symbol = typeChecker.getSymbolAtLocation(ids[0]);

  if (symbol !== undefined && (symbol.flags & ts.SymbolFlags.Alias)) {
    const original = typeChecker.getAliasedSymbol(symbol);
    const fileName = original.getDeclarations()![0].getSourceFile().fileName;
    const relName = fileName.replace(/\.ts$/, '').replace(new RegExp(`^${process.cwd()}`), '.');
    if (original.name.startsWith('"/')) {
      idStrs[0] = relName;
    } else {
      idStrs[0] = `${relName}.${symbol.getDeclarations()![0].getChildAt(0).getText()}`;
    }
  }

  return idStrs.join('.');
}

function *findNodesByKind(node: ts.Node, ...kinds: ts.SyntaxKind[]): Iterable<ts.Node> {
  if (kinds.some(k => k === node.kind)) {
    yield node;
  }
  for (const n of node.getChildren()) {
    yield * findNodesByKind(n, ...kinds);
  }
}
