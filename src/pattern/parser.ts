import * as P from 'parsimmon';
import * as node from './node';
import { typeParser } from './type/parser';
import { Pattern } from './pattern';

export function parse(patterns: string[]) {
  const exprs = patterns.map((pat, idx) => {
    try {
      return parser.Expression.tryParse(pat);
    } catch (e) {
      e.index = idx;
      throw e;
    }
  });
  return new Pattern(exprs);
}

const parser = P.createLanguage({

  Expression: l => P.sepBy1(l.Term, l.OR).trim(P.optWhitespace)
    .map(r => new node.Expression(r)),

  Term: l => P.sepBy1(l.Factor, l.AND).trim(P.optWhitespace)
    .map(r => new node.Term(r)),

  Factor: l => P.seq(l.Element, l.TypeAnnotation.times(0, 1)).trim(P.optWhitespace)
    .map(r => new node.Factor(r[0], r[1].length === 0 ? undefined : r[1][0])),

  Element: l => P.alt(
    l.NOT.then(l.Element).map(f => new node.Not(f)),
    l.Expression.wrap(l.LPAREN, l.RPAREN),
    l.Atom,
  ).trim(P.optWhitespace),

  Atom: l => P.alt(
    l.Wildcard,
    /* and more */
  ).trim(P.optWhitespace),

  Wildcard: _ => P.string('_').trim(P.optWhitespace)
    .map(_ => new node.Wildcard()),

  TypeAnnotation: l => l.COLON.then(typeParser).trim(P.optWhitespace),

  LPAREN: _ => P.string('(').trim(P.optWhitespace),

  RPAREN: _ => P.string(')').trim(P.optWhitespace),

  COLON: _ => P.string(':').trim(P.optWhitespace),

  AND: _ => P.string('&&').trim(P.optWhitespace),

  OR: _ => P.string('||').trim(P.optWhitespace),

  NOT: _ => P.string('!').trim(P.optWhitespace),

});
