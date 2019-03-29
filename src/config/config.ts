import * as ts from 'typescript';
import { Program } from '../typescript/program';
import { Files } from '../typescript/file/files';
import { Rule } from './rule';
import { ScanResult } from './scanResult';

export class Config {

  constructor(
    readonly rules: ReadonlyArray<Rule>,
  ) {}

  *scan(files: Files, tsconfigPath: string) {
    const prog = new Program(files, tsconfigPath);
    for (const result of prog.getSourceFiles(s => !s.includes('node_modules/'))) {
      const matches = result.isSuccessfullyParsed()
        ? new Map(this.rules.map(r =>  [r, r.scan(result)] as [Rule, Iterable<ts.Node>]))
        : undefined;
      yield new ScanResult(result.path, result, matches);
    }
  }

  *test() {
    for (const rule of this.rules) {
      yield * rule.test();
    }
  }
}
