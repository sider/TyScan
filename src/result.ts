import { Diagnostic } from './compiler';
import { Rule } from './config';

export class ScanResult {
  constructor(
    readonly ranges: ReadonlyArray<Match> | undefined,
    readonly diagnostics: ReadonlyArray<Diagnostic>,
  ) {}
}

export class Match {
  constructor(
    readonly rule: Rule,
    readonly ranges: ReadonlyArray<Range>,
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
    readonly row: number,
    readonly col: number,
  ) {}
}
