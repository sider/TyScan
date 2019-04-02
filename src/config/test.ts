import { Program } from '../typescript/program';
import { Files } from '../typescript/file/files';
import { VirtualFile } from '../typescript/file/virtualFile';
import { Rule } from './rule';
import { TestResult } from './testResult';

export class Test {

  constructor(
    readonly rule: Rule,
    readonly match: boolean,
    readonly index: number,
    readonly code: string,
    readonly tsconfigPath: string,
  ) {}

  run() {
    const path = '__tyscan_test__.tsx';

    const files = new Files(...[new VirtualFile(path, this.code)]);
    const program = new Program(files, this.tsconfigPath);
    const result = program.getSourceFiles(p => p === path).next().value;

    let success: boolean | undefined = undefined;
    if (result.isSuccessfullyParsed()) {
      success = !this.rule.scan(result).next().done === this.match;
    }

    return new TestResult(this, result, success);
  }
}
