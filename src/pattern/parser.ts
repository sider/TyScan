import * as P from 'parsimmon';
import * as node from './node';
import { typeParser } from './type/parser';
import { Pattern } from './pattern';

export function parse(patterns: string[]) {
  const exprs = patterns.map((pat, idx) => {
    try {
      return parser.Root.tryParse(pat);
    } catch (e) {
      e.index = idx;
      throw e;
    }
  });
  return new Pattern(exprs);
}

const parser = P.createLanguage({

  Root: L => P.alt(L.Expression, L.Jsx),

  Jsx: L => P.seq(L.LT, L.NAME, L.JsxAttrs, L.GT)
    .map(r => new node.Jsx(r[1], r[2])),

  JsxAttrs: L => L.JsxAttr.many()
    .map((r) => {
      const map = new Map<[string, boolean], node.JsxAttrValue>();
      for (const t of r) {
        map.set([t[0], t[1]], t[2]);
      }
      return map;
    }),

  JsxAttr: L => P.seq(L.ATTR_NAME, P.alt(L.EQ, L.NE), L.JsxAttrValue)
    .map(r => [r[0], r[1] === '=', r[2]]),

  JsxAttrValue: L => P.alt(P.seq(L.LBRACE, L.Factor, L.RBRACE), P.seq(L.Literal))
    .map(r => new node.JsxAttrValue(r.length === 1 ? r[0] : r[1])),

  Expression: L => P.sepBy1(L.Term, L.OR).trim(P.optWhitespace)
    .map(r => new node.Expression(r)),

  Term: L => P.sepBy1(P.alt(L.Factor, L.Literal), L.AND).trim(P.optWhitespace)
    .map(r => new node.Term(r)),

  Factor: L => P.seq(L.Call, L.TypeAnnotation.times(0, 1)).trim(P.optWhitespace)
    .map(r => new node.Factor(r[0], r[1].length === 0 ? undefined : r[1][0])),

  Literal: L => P.alt(L.StringLiteralDq, L.StringLiteralSq),

  StringLiteralDq: _ => P.regexp(/"((?:\\.|.)*?)"/, 1).trim(P.optWhitespace)
    .map(interpretEscapes).map(s => new node.StringLiteral(s)),

  StringLiteralSq: _ => P.regexp(/'((?:\\.|.)*?)'/, 1).trim(P.optWhitespace)
    .map(interpretEscapes).map(s => new node.StringLiteral(s)),

  TypeAnnotation: L => L.COLON.then(typeParser).trim(P.optWhitespace),

  Call: L => P.seq(L.Element, L.CallArgs.wrap(L.LPAREN, L.RPAREN).times(0, 1))
    .map(r => r[1].length === 0 ? r[0] : new node.Call(r[0], r[1][0])),

  Element: L => P.sepBy1(L.Atom, L.DOT).map((r) => {
    let e = new node.Element(undefined, r[0]);
    for (let i = 1; i < r.length; i += 1) {
      e = new node.Element(e, r[i]);
    }
    return e;
  }),

  Atom: L => P.alt(
    L.NOT.then(L.Atom).map(f => new node.Not(f)),
    L.Expression.wrap(L.LPAREN, L.RPAREN),
    L.Wildcard,
    L.NAME.map(t => new node.Identifier(t)),
  ).trim(P.optWhitespace),

  Wildcard: L => L.USCORE
    .map(_ => new node.Wildcard()),

  CallArgs: L => P.sepBy(P.alt(L.Expression, L.DOTS), L.COMMA)
    .map((r) => {
      const arr = <any[]>[];
      let last = {};
      for (let i = 0; i < r.length; i += 1) {
        if (last !== r[i]) {
          arr.push(r[i]);
          last = r[i];
        }
      }
      return arr;
    }),

  NAME: _ => P.regex(/[a-zA-Z$_][a-zA-Z0-9$_]*/).trim(P.optWhitespace),

  ATTR_NAME: _ => P.regex(/[a-zA-Z$_-][a-zA-Z0-9$_-]*/).trim(P.optWhitespace),

  LPAREN: _ => P.string('(').trim(P.optWhitespace),

  RPAREN: _ => P.string(')').trim(P.optWhitespace),

  LBRACE: _ => P.string('{').trim(P.optWhitespace),

  RBRACE: _ => P.string('}').trim(P.optWhitespace),

  LT: _ => P.string('<').trim(P.optWhitespace),

  GT: _ => P.string('>').trim(P.optWhitespace),

  EQ: _ => P.string('=').trim(P.optWhitespace),

  NE: _ => P.string('!=').trim(P.optWhitespace),

  COLON: _ => P.string(':').trim(P.optWhitespace),

  AND: _ => P.string('&&').trim(P.optWhitespace),

  OR: _ => P.string('||').trim(P.optWhitespace),

  NOT: _ => P.string('!').trim(P.optWhitespace),

  COMMA: _ => P.string(',').trim(P.optWhitespace),

  DOT: _ => P.string('.').trim(P.optWhitespace),

  USCORE: _ => P.string('_').trim(P.optWhitespace),

  DOTS: _ => P.string('...').trim(P.optWhitespace).map(_ => undefined),

});

// REF: https://github.com/jneen/parsimmon/blob/master/examples/json.js
function interpretEscapes(str: string) {
  const escapes = {
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t',
  };
  return str.replace(/\\(u[0-9a-fA-F]{4}|[^u])/, (_, escape) => {
    const type = escape.charAt(0);
    const hex = escape.slice(1);
    if (type === 'u') {
      return String.fromCharCode(parseInt(hex, 16));
    }
    if (escapes.hasOwnProperty(type)) {
      return (<any>escapes)[type];
    }
    return type;
  });
}
