import * as compiler from './compiler';
import { Expression } from './pattern';
import { scan, test } from './result';

export class Config {

  constructor(
    readonly rules: ReadonlyArray<Rule>,
  ) {}

  *scan(paths: string[]) {
    for (const path of paths) {
      const result = compiler.compileFile(path);

      const matches = result.isSuccessful()
        ? this.rules.map(r =>  new scan.Match(r, r.scan(result)))
        : undefined;

      yield new scan.Result(path, result, matches);
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
    readonly pattern: Expression,
  ) {}

  *scan(result: compiler.Result) {
    yield * this.pattern.scan(result);
  }

  *test() {
    for (const t of this.tests) {
      yield t.run();
    }
  }

}

export class Test {

  constructor(
    readonly rule: Rule,
    readonly match: boolean,
    readonly index: number,
    readonly code: string,
  ) {}

  run() {
    const result = compiler.compileString(this.code);

    const success = result.isSuccessful()
      ? !this.rule.scan(result).next().done === this.match
      : undefined;

    return new test.Result(this, result, success);
  }

}
