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

  Expression: L =>P.sepBy1(L.Term, L.OR).trim(P.optWhitespace)
    .map(r => new node.Expression(r)),

  Term: L =>P.sepBy1(L.Factor, L.AND).trim(P.optWhitespace)
    .map(r => new node.Term(r)),

  Factor: L =>P.seq(L.Element, L.TypeAnnotation.times(0, 1)).trim(P.optWhitespace)
    .map(r => new node.Factor(r[0], r[1].length === 0 ? undefined : r[1][0])),

  Element: L =>P.alt(
    L.NOT.then(L.Element).map(f => new node.Not(f)),
    L.Expression.wrap(L.LPAREN, L.RPAREN),
    L.Atom,
  ).trim(P.optWhitespace),

  Atom: L =>P.alt(
    L.Wildcard,
    /* and more */
  ).trim(P.optWhitespace),

  Wildcard: _ => P.string('_').trim(P.optWhitespace)
    .map(_ => new node.Wildcard()),

  TypeAnnotation: L =>L.COLON.then(typeParser).trim(P.optWhitespace),

  LPAREN: _ => P.string('(').trim(P.optWhitespace),

  RPAREN: _ => P.string(')').trim(P.optWhitespace),

  COLON: _ => P.string(':').trim(P.optWhitespace),

  AND: _ => P.string('&&').trim(P.optWhitespace),

  OR: _ => P.string('||').trim(P.optWhitespace),

  NOT: _ => P.string('!').trim(P.optWhitespace),

});
