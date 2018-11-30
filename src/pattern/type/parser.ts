import * as P from 'parsimmon';
import * as node from './node';

const parser = P.createLanguage({

  Type: L => P.alt(L.FunctionType, L.UnionType).trim(P.optWhitespace),

  FunctionType: L => P.seq(L.FunctionArgList.skip(L.ARROW), L.Type)
    .map(r => new node.FunctionType(r[0], r[1])),

  FunctionArgList: L => P.sepBy(L.FunctionArg, L.COMMA).wrap(L.LPAREN, L.RPAREN),

  FunctionArg: L => L.USCORE.then(L.COLON).then(L.Type),

  UnionType: L => P.sepBy1(L.IntersectionType, L.OR)
    .map(r => new node.UnionType(r)),

  IntersectionType: L => P.sepBy1(L.ArrayType, L.AND)
    .map(r => new node.IntersectionType(r)),

  ArrayType: L => P.seq(L.PrimaryType, L.BRACKS)
    .map(r => new node.ArrayType(r[0], r[1])),

  PrimaryType: L => P.alt(
    L.Type.wrap(L.LPAREN, L.RPAREN),
    L.TupleType,
    L.ObjectType,
    L.AtomicType
  ),

  TupleType: L => P.sepBy(L.Type, L.COMMA).wrap(L.LBRACK, L.RBRACK)
    .map(r => new node.TupleType(r)),

  ObjectType: L => P.sepBy(P.alt(L.DOTS, L.ObjectElement), L.COMMA).wrap(L.LBRACE, L.RBRACE)
    .map(r => {
      const open = r.some(s => s === undefined);
      const keyvals = r.filter(s => s !== undefined).map(s => [s[0], s[1]] as [string, node.Node]);
      return new node.ObjectType(new Map<string, node.Node>(keyvals), open);
    }),

  ObjectElement: L => P.seq(L.NAME.skip(L.COLON), L.Type),

  AtomicType: L => P.alt(L.Predefined, L.Reference),

  Reference: L => P.seq(L.Module, L.NAME, L.TypeArgs.times(0, 1))
    .map(r => new node.Reference(r[0], r[1], r[2])),

  TypeArgs: L => P.sepBy1(L.Type, L.COMMA).wrap(L.LT, L.GT),

  Module: L => P.seq(L.Path, P.regex(/[a-zA-Z$_][a-zA-Z0-9$_]*\./).many()),

  Path: _ => P.regex(/[a-zA-Z$_][a-zA-Z0-9$_]*\//).many(),

  Predefined: _ => P.alt(
    P.string('any'),
    P.string('number'),
    P.string('string'),
    P.string('boolean'),
    P.string('void'),
  ).trim(P.optWhitespace).map(r => new node.Predefined(r)),

  BRACKS: L => L.LBRACK.then(L.RBRACK).many().map(r => r.length),

  NAME: _ => P.regex(/[a-zA-Z$_][a-zA-Z0-9$_]*/).trim(P.optWhitespace),

  LPAREN: _ => P.string('(').trim(P.optWhitespace),

  RPAREN: _ => P.string(')').trim(P.optWhitespace),

  LBRACK: _ => P.string('[').trim(P.optWhitespace),

  RBRACK: _ => P.string(']').trim(P.optWhitespace),

  LBRACE: _ => P.string('{').trim(P.optWhitespace),

  RBRACE: _ => P.string('}').trim(P.optWhitespace),

  DOTS: _ => P.string('...').trim(P.optWhitespace).map(_ => undefined),

  LT: _ => P.string('<').trim(P.optWhitespace),

  GT: _ => P.string('>').trim(P.optWhitespace),

  COLON: _ => P.string(':').trim(P.optWhitespace),

  COMMA: _ => P.string(',').trim(P.optWhitespace),

  USCORE: _ => P.string('_').trim(P.optWhitespace),

  ARROW: _ => P.string('=>').trim(P.optWhitespace),

  AND: _ => P.string('&').trim(P.optWhitespace),

  OR: _ => P.string('|').trim(P.optWhitespace),

});

export const typeParser = parser.Type;
