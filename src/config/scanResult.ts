import * as ts from 'typescript';
import { SourceFile } from '../typescript/sourceFile';
import { Rule } from './rule';

export class ScanResult {

  constructor(
    readonly path: string,
    readonly compileResult: SourceFile,
    readonly nodes: ReadonlyMap<Rule, Iterable<ts.Node>> | undefined,
  ) {}
}
