import * as ts from 'typescript';
import { CompileErrors } from './compiler';
import { Rule, Test } from './config';

export namespace scan {

  export class Result {
    constructor(
      readonly path: string,
      readonly errors: CompileErrors,
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
      readonly errors: CompileErrors,
      readonly success: boolean | undefined,
    ) {}
  }

}
