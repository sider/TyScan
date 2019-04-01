import { Pattern } from '../pattern/pattern';
import { SourceFile } from '../typescript/sourceFile';
import { Test } from './test';

export class Rule {

  readonly tests = <Test[]>[];

  constructor(
    readonly id: string,
    readonly message: string,
    readonly justification: string | undefined,
    readonly pattern: Pattern,
  ) {}

  *scan(result: SourceFile) {
    yield * this.pattern.scan(result);
  }

  *test() {
    for (const t of this.tests) {
      yield t.run();
    }
  }
}
