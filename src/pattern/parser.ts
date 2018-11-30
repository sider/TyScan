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

  Expression: r => P.sepBy1(r.Term.trim(P.optWhitespace), P.string('||'))
    .map(ts => new node.Expression(ts)),

  Term: r => P.sepBy1(r.Factor.trim(P.optWhitespace), P.string('&&'))
    .map(fs => new node.Term(fs)),

  Factor: r => P.alt(
    r.NotFactor,
    r.ParenedExpression,
    r.Wildcard,
    r.Null,
    r.Undefined,
  ),

  NotFactor: r => P.string('!').trim(P.optWhitespace).then(r.Factor)
    .map(f => new node.NotFactor(f)),

  ParenedExpression: r => r.Expression.trim(P.optWhitespace).wrap(P.string('('), P.string(')'))
    .map(e => new node.ParenedExpression(e)),

  Wildcard: r => P.string('_').trim(P.optWhitespace).then(r.TypeAnnotation.times(0, 1))
    .map(a => new node.Wildcard(a.length === 1 ? a[0] : undefined)),

  Null: _ => P.string('null').trim(P.optWhitespace)
    .map(_ => new node.Null()),

  Undefined: _ => P.string('undefined').trim(P.optWhitespace)
    .map(_ => new node.Undefined()),

  TypeAnnotation: r => P.string(':').trim(P.optWhitespace).then(typeParser),

});
