import * as ts from 'typescript';
import { Result as CompileResult } from './compiler';
import { Rule, Test } from './config';

export namespace scan {

  export class Result {
    constructor(
      readonly path: string,
      readonly compileResult: CompileResult,
      readonly matches: ReadonlyArray<Match> | undefined,
    ) {}
  }

  export class Match {
    constructor(
      readonly rule: Rule,
      readonly ranges: IterableIterator<Range>,
    ) {}
  }

  export class Range {
    constructor(
      readonly start: ts.LineAndCharacter,
      readonly end: ts.LineAndCharacter,
    ) {}
  }

}

export namespace test {

  export class Result {
    constructor(
      readonly test: Test,
      readonly compileResult: CompileResult,
      readonly success: boolean | undefined,
    ) {}
  }

}
