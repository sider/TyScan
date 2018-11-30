import * as P from 'parsimmon';
import * as node from './node';

const parser = P.createLanguage({

  Type: r => P.alt(r.FunctionType, r.UnionType),

  FunctionType: r => P.seq(
    P.sepBy(
      P.string('_').trim(P.optWhitespace).then(P.string(':')).trim(P.optWhitespace).then(r.Type),
      P.string(','),
    ).wrap(P.string('('), P.string(')')).trim(P.optWhitespace),
    P.string('=>').trim(P.optWhitespace),
    r.Type,
  ).map(ss => new node.FunctionType(ss[0], ss[2])),

  UnionType: r => P.sepBy1(r.IntersectionType, P.string('|')).trim(P.optWhitespace)
    .map(is => new node.UnionType(is)),

  IntersectionType: r => P.sepBy1(r.ArrayType, P.string('&'))
    .map(as => new node.IntersectionType(as)),

  ArrayType: r => P.seq(
    r.PrimaryType.trim(P.optWhitespace),
    P.seq(P.string('['), P.string(']')).many().map(ss => ss.length),
  ).map(ss => new node.ArrayType(ss[0], ss[1])),

  PrimaryType: r => P.alt(
    r.ParenedTypeExpression,
    r.TupleType,
    r.ObjectType,
    r.AtomicType,
  ),

  ParenedTypeExpression: r => r.Type.wrap(P.string('('), P.string(')')),

  TupleType: r => P.sepBy(r.Type, P.string(','))
    .wrap(P.string('['), P.string(']')).trim(P.optWhitespace)
    .map(us => new node.TupleType(us)),

  ObjectType: r => P.sepBy(r.ObjectElement, P.string(','))
    .wrap(P.string('{'), P.string('}')).map((ss) => {
      const open = ss.some(s => s === undefined);
      const keyvals = ss.filter(s => s !== undefined)
        .map(s => [s[0], s[1]] as [string, node.TopLevelType]);
      return new node.ObjectType(new Map<string, node.TopLevelType>(keyvals), open);
    }),

  ObjectElement: r => P.alt(
    P.string('...').trim(P.optWhitespace).map(_ => undefined),
    P.seq(
      P.regex(/[a-zA-Z$_][a-zA-Z0-9$_]*/).trim(P.optWhitespace),
      P.string(':').trim(P.optWhitespace),
      r.Type,
    ).map(ss => [ss[0], ss[2]] as [string, node.TopLevelType]),
  ),

  AtomicType: r => P.seq(
    P.regex(/\.\//).times(0, 1).trim(P.optWhitespace),
    P.regex(/[a-zA-Z$_][a-zA-Z0-9$_]*\//).many().trim(P.optWhitespace),
    P.regex(/[a-zA-Z$_][a-zA-Z0-9$_]*\./).many().trim(P.optWhitespace),
    P.regex(/[a-zA-Z$_][a-zA-Z0-9$_]*/).trim(P.optWhitespace),
    P.sepBy1(r.Type, P.string(',').trim(P.optWhitespace))
      .wrap(P.string('<'), P.string('>')).times(0, 1),
  ).trim(P.optWhitespace).map(ss => new node.AtomicType(
    0 < ss[0].length,
    ss[1].map(s => s.slice(0, -1)),
    ss[2].map(s => s.slice(0, -1)),
    ss[3],
    ss[4].length === 0 ? [] : ss[4][0],
  )),

});

export const typeParser = parser.Type;
