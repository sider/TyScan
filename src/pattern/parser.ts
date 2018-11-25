import * as P from 'parsimmon';
import * as component from './component';

export function parse(patterns: string[]) {
  const terms = patterns.map((pat, idx) => {
    try {
      return parser.Term.tryParse(pat);
    } catch (e) {
      e.index = idx;
      throw e;
    }
  });
  return new component.Expression(terms);
}

const parser = P.createLanguage({

  Term: r => r.Identifier.map(qi => new component.Term(qi)),

  Identifier: _ => P.regex(/[\/\.a-zA-Z0-9_-]+/).map(s => new component.Identifier(s)),

});
