import * as P from 'parsimmon';
import * as syntaxNode from './syntaxNode';
import * as typeNode from './typeNode';
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
    .map(ts => new syntaxNode.Expression(ts)),

  Term: r => P.sepBy1(r.Factor.trim(P.optWhitespace), P.string('&&'))
    .map(fs => new syntaxNode.Term(fs)),

  Factor: r => P.alt(
    r.NotFactor,
    r.ParenedExpression,
    r.Wildcard,
    r.Null,
    r.Undefined,
  ),

  NotFactor: r => P.string('!').trim(P.optWhitespace).then(r.Factor)
    .map(f => new syntaxNode.NotFactor(f)),

  ParenedExpression: r => r.Expression.trim(P.optWhitespace).wrap(P.string('('), P.string(')'))
    .map(e => new syntaxNode.ParenedExpression(e)),

  Wildcard: r => P.string('_').trim(P.optWhitespace).then(r.TypeAnnotation.times(0, 1))
    .map(a => new syntaxNode.Wildcard(a.length === 1 ? a[0] : undefined)),

  Null: _ => P.string('null').trim(P.optWhitespace)
    .map(_ => new syntaxNode.Null()),

  Undefined: _ => P.string('undefined').trim(P.optWhitespace)
    .map(_ => new syntaxNode.Undefined()),

  TypeAnnotation: r => P.string(':').trim(P.optWhitespace).then(r.Type),

  Type: r => P.alt(r.FunctionType, r.UnionType),

  FunctionType: r => P.seq(
    P.sepBy(
      P.string('_').trim(P.optWhitespace).then(P.string(':')).trim(P.optWhitespace).then(r.Type),
      P.string(',')
    ).wrap(P.string('('), P.string(')')).trim(P.optWhitespace),
    P.string('=>').trim(P.optWhitespace),
    r.Type
  ).map(ss => new typeNode.FunctionType(ss[0], ss[2])),

  UnionType: r => P.sepBy1(r.IntersectionType, P.string('|')).trim(P.optWhitespace)
    .map(is => new typeNode.UnionType(is)),

  IntersectionType: r => P.sepBy1(r.ArrayType, P.string('&'))
    .map(as => new typeNode.IntersectionType(as)),

  ArrayType: r => P.seq(
    r.PrimaryType.trim(P.optWhitespace),
    P.seq(P.string('['), P.string(']')).many().map(ss => ss.length)
  ).map(ss => new typeNode.ArrayType(ss[0], ss[1])),

  PrimaryType: r => P.alt(
    r.ParenedTypeExpression,
    r.TupleType,
    r.AtomicType,
  ),

  ParenedTypeExpression: r => r.UnionType.wrap(P.string('('), P.string(')')),

  TupleType: r => P.sepBy(r.UnionType, P.string(','))
    .wrap(P.string('['), P.string(']')).trim(P.optWhitespace)
    .map(us => new typeNode.TupleType(us)),

  AtomicType: r => P.seq(
    P.regex(/\.\//).times(0, 1).trim(P.optWhitespace),
    P.regex(/[^\/]+\//).many().trim(P.optWhitespace),
    P.regex(/[^\.]+\./).many().trim(P.optWhitespace),
    P.regex(/[a-zA-Z$_][a-zA-Z0-9$_]*/).trim(P.optWhitespace),
    P.sepBy1(r.UnionType, P.string(',').trim(P.optWhitespace))
      .wrap(P.string('<'), P.string('>')).times(0, 1)
  ).trim(P.optWhitespace).map(ss => new typeNode.AtomicType(
    0 < ss[0].length,
    ss[1].map(s => s.slice(0, -1)),
    ss[2].map(s => s.slice(0, -1)),
    ss[3],
    ss[4].length === 0 ? [] : ss[4][0],
  )),

});
