import { Pattern } from '../pattern/pattern';
import { SourceFile } from '../typescript/sourceFile';
import { Test } from './test';

export class Rule {

  readonly id: string;

  readonly message: string;

  readonly pattern: Pattern;

  readonly justification?: string;

  readonly tests = <Test[]>[];

  constructor(id: string, message: string, pattern: Pattern, justification?: string) {
    this.id = id;
    this.message = message;
    this.pattern = pattern;
    this.justification = justification;
  }

  *scan(result: SourceFile) {
    yield * this.pattern.scan(result);
  }

  *test() {
    for (const t of this.tests) {
      yield t.run();
    }
  }
}
