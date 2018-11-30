import * as P from 'parsimmon';
import * as node from './node';

const parser = P.createLanguage({

  Type: L => P.alt(L.FunctionType, L.UnionType).trim(P.optWhitespace),

  FunctionType: L => P.seq(L.FunctionArgList.skip(L.ARROW), L.Type),

  FunctionArgList: L => P.sepBy(L.FunctionArg, L.COMMA).wrap(L.LPAREN, L.RPAREN),

  FunctionArg: L => L.USCORE.then(L.COLON).then(L.Type),

  UnionType: L => P.sepBy1(L.IntersectionType, L.OR),

  IntersectionType: L => P.sepBy1(L.ArrayType, L.AND),

  ArrayType: L => P.seq(L.PrimaryType, L.BRACKS),

  PrimaryType: L => P.alt(
    L.Type.wrap(L.LPAREN, L.RPAREN),
    L.TupleType,
    L.ObjectType,
    L.AtomicType
  ),

  TupleType: L => P.sepBy(L.Type, L.COMMA).wrap(L.LBRACK, L.RBRACK),

  ObjectType: L => P.sepBy(P.alt(L.DOTS, L.ObjectElement), L.COMMA).wrap(L.LBRACE, L.RBRACE),

  ObjectElement: L => P.seq(L.NAME.skip(L.COLON), L.Type),

  AtomicType: L => P.alt(L.Predefs, L.Reference),

  Reference: L => P.seq(L.Module, L.NAME, L.TypeArgs.times(0, 1)),

  TypeArgs: L => P.sepBy1(L.Type, L.COMMA).wrap(L.LT, L.GT),

  Module: L => P.seq(L.Path, P.regex(/[a-zA-Z$_][a-zA-Z0-9$_]*\./).many()),

  Path: _ => P.regex(/[a-zA-Z$_][a-zA-Z0-9$_]*\//).many(),

  Predefs: _ => P.alt(
    P.string('any'),
    P.string('number'),
    P.string('string'),
    P.string('boolean'),
    P.string('void'),
  ).trim(P.optWhitespace),

  BRACKS: L => L.LBRACK.then(L.RBRACK).many().map(r => r.length),

  NAME: _ => P.regex(/[a-zA-Z$_][a-zA-Z0-9$_]*/).trim(P.optWhitespace),

  LPAREN: _ => P.string('(').trim(P.optWhitespace),

  RPAREN: _ => P.string(')').trim(P.optWhitespace),

  LBRACK: _ => P.string('[').trim(P.optWhitespace),

  RBRACK: _ => P.string(']').trim(P.optWhitespace),

  LBRACE: _ => P.string('{').trim(P.optWhitespace),

  RBRACE: _ => P.string('}').trim(P.optWhitespace),

  DOTS: _ => P.string('...').trim(P.optWhitespace),

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
