export class Config {

  constructor(
    readonly rules: ReadonlyArray<Rule>,
  ) {}

}

export class Rule {

  constructor(
    readonly id: string,
    readonly message: string,
    readonly pattern: Pattern,
    readonly matchTests: TestSuite,
    readonly unmatchTests: TestSuite,
  ) {}

}

export class Pattern {

  constructor() {}

}

export class TestSuite {

  constructor(
    readonly tests: ReadonlyArray<string>,
  ) {}

}
