import * as P from 'parsimmon';
import * as ts from 'typescript';
import { scan } from './result';

export class Pattern {

  readonly asts: ReadonlyArray<any>;

  constructor(strs: string[]) {
    this.asts = strs.map((s) => {
      try {
        return parser.Pattern.tryParse(s);
      } catch (e) {
        throw new Error(`Invalid pattern "${s}": ${e.message}`);
      }
    })
  }

  *scan(_: ts.Program): IterableIterator<scan.Range> {
  }

}

const parser = P.createLanguage({

  Pattern: r => r.QualifiedIdentifier,

  QualifiedIdentifier: r => r.Identifier.sepBy1(P.string('.')),

  Identifier: _ => P.regex(/[a-zA-Z_-][a-zA-Z0-9_-]*/),

});
