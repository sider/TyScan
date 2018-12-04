import { parse } from '../../src/pattern/parser';
import { compileString } from '../../src/compiler';
import { expect } from 'chai';

describe('pattern', () => {

  const tests = [
    ['_', 'const x = 1;', 1],
    ['_(_: string)', 'f("...")', 1],
    ['_._(_)', 'ns.f("...")', 1],
    ['_._(_)', 'f("...")', 0],
    ['f(_)', 'f("...")', 1],
    ['!f(_)', 'f("...")', 0],
    ['f(_, ...)', 'f(1)', 1],
    ['f(_, ...)', 'f(1, 2)', 1],
    ['f(..., _)', 'f(1)', 1],
  ] as [string, string, number][];

  for (const [pattern, code, count] of tests) {
    it(`"${pattern}" should match "${code}" ${count} time(s)`, () => {
      expect(countMatches(pattern, code)).eq(count);
    });
  }

});

describe('type pattern', () => {

  const tests = [
    ['_: string', 'f("")', 1],
    ['_: boolean', 'f(true)', 1],
    ['_: number', 'f(100)', 1],
    ['f(_: any)', 'let x: any; f(x)', 1],
    ['f(_: string | number)', 'let x: string | number; f(x)', 1],
    ['_: number[]', '[1, 1]', 1],
    ['f(_: {key: number})', 'f({key: 1})', 1],
    ['f(_: {key: number})', 'f({key: "..."})', 0],
    ['f(_: {key: number})', 'f({x: 1})', 0],
    ['f(_: {x: number})', 'f({x: 1, y: 1})', 0],
    ['f(_: {x: number, ...})', 'f({x: 1, y: 1})', 1],
    ['_: (_: number) => void', 'function f(i: number): void { } f(1)', 1],
  ] as [string, string, number][];

  for (const [pattern, code, count] of tests) {
    it(`"${pattern}" should match "${code}" ${count} time(s)`, () => {
      expect(countMatches(pattern, code)).eq(count);
    });
  }

});

function countMatches(pattern: string, code: string) {
  const r = compileString(code);
  const p = parse([pattern]);
  return Array.from(p.scan(r.srcFile, r.program.getTypeChecker())).length;
}
