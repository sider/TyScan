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

  Term: r => P.seqMap(
    r.FunctionId,
    r.FunctionArgs.times(0, 1),
    (a1, a2) => new component.Term(a1, a2.length === 0 ? undefined : a2[0])
  ),

  FunctionId: r => r.Id.map(s => new component.FunctionId(s)),

  FunctionArgs: r => r.TypeId.sepBy(P.string(',')).wrap(P.string('('), P.string(')')),

  TypeId: _ => P.string('any'),

  Id: _ => P.regex(/[\/\.a-zA-Z0-9_-]+/)

});
