import { Program } from '../typescript/program';
import { Files } from '../typescript/file/files';
import { VirtualFile } from '../typescript/file/virtualFile';
import { Rule } from './rule';
import { TestResult } from './testResult';

export class Test {
  readonly rule: Rule;

  readonly match: boolean;

  readonly index: number;

  readonly code: string;

  readonly tsconfigPath: string;

  constructor(rule: Rule, match: boolean, index: number, code: string, tsconfigPath: string) {
    this.rule = rule;
    this.match = match;
    this.index = index;
    this.code = code;
    this.tsconfigPath = tsconfigPath;
  }

  run() {
    const path = '__tyscan_test__.tsx';

    const files = new Files([new VirtualFile(path, this.code)]);
    const program = new Program(files, this.tsconfigPath);
    const result = program.getSourceFiles((p) => p === path).next().value;

    let success: boolean | undefined = undefined;
    if (result.isSuccessfullyParsed()) {
      success = !this.rule.scan(result).next().done === this.match;
    }

    return new TestResult(this, success);
  }
}
