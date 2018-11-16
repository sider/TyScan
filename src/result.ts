import { Diagnostic } from './compiler';
import { Rule, Test } from './config';

export namespace scan {

  export class Result {
    constructor(
      readonly path: string,
      readonly diagnostics: ReadonlyArray<Diagnostic>,
      readonly matches: IterableIterator<Match> | undefined,
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
      readonly begin: Position,
      readonly end: Position,
    ) {}
  }

  export class Position {
    constructor(
      readonly line: number,
      readonly char: number,
    ) {}
  }

}

export namespace test {

  export class Result {
    constructor(
      readonly test: Test,
      readonly diagnostics: ReadonlyArray<Diagnostic>,
      readonly success: boolean | undefined,
    ) {}
  }

}
