import * as ts from 'typescript';
import * as compiler from './compiler';
import { scan, test } from './result';

export class Config {

  constructor(
    readonly rules: ReadonlyArray<Rule>,
  ) {}

  *scan(paths: string[]) {
    for (const path of paths) {
      const result = compiler.compileFile(path);

      const matches = result.success
        ? this.rules.map(r => new scan.Match(r, r.scan(result.program)))
        : undefined;

      yield new scan.Result(path, result.errors, matches);
    }
  }

  *test() {
    for (const rule of this.rules) {
      yield * rule.test();
    }
  }

}

export class Rule {

  readonly tests = <Test[]>[];

  constructor(
    readonly id: string,
    readonly message: string,
    readonly pattern: Pattern,
  ) {}

  *scan(program: ts.Program) {
    yield * this.pattern.scan(program);
  }

  *test() {
    for (const t of this.tests) {
      yield t.run();
    }
  }

}

export class Pattern {

  constructor() {}

  *scan(_: ts.Program): IterableIterator<scan.Range> {
  }

}

export class Test {

  constructor(
    readonly rule: Rule,
    readonly match: boolean,
    readonly index: number,
    readonly code: string,
  ) {}

  run(): test.Result {
    const result = compiler.compileString(this.code);

    let success = undefined;
    if (result.success) {
      const hasMatch = !this.rule.scan(result.program).next().done;
      success = hasMatch === this.match;
    }

    return new test.Result(this, result.errors, success);
  }

}
