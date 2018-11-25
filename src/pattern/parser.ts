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
  return new component.Expr(terms);
}

const parser = P.createLanguage({

  Term: r => P.seq(r.FuncId, r.FuncArgs.times(0, 1))
    .map(a => new component.Term(a[0], a[1].length === 0 ? undefined : a[1][0])),

  FuncId: r => r.Id
    .map(a => new component.FuncId(a)),

  FuncArgs: r => r.FuncArgList.wrap(P.string('('), P.string(')'))
    .map(a => new component.FuncArgs(a)),

  FuncArgList: r => r.TypeId.sepBy(P.string(','))
    .map(a => a),

  TypeId: r => r.Id
    .map(a => new component.TypeId(a)),

  Id: _ => P.regex(/(\.\/)?(\w+\/)*(\w+\.)*(\w+)/).trim(P.optWhitespace)
    .map(a => a),

});
