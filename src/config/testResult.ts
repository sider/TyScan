import { SourceFile } from '../typescript/sourceFile';
import { Test } from './test';

export class TestResult {

  constructor(
    readonly test: Test,
    readonly compileResult: SourceFile,
    readonly success: boolean | undefined,
  ) {}
}
