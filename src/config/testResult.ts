import { Test } from './test';

export class TestResult {

  readonly test: Test;

  readonly success?: boolean;

  constructor(test: Test, success?: boolean) {
    this.test = test;
    this.success = success;
  }
}
