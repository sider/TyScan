import * as ts from 'typescript';
import { SourceFile } from '../typescript/sourceFile';
import { Rule } from './rule';

export class ScanResult {

  readonly path: string;

  readonly sourceFile: SourceFile;

  readonly nodes?: ReadonlyMap<Rule, Iterable<ts.Node>>;

  constructor(path: string, sourceFile: SourceFile, nodes?: ReadonlyMap<Rule, Iterable<ts.Node>>) {
    this.path = path;
    this.sourceFile = sourceFile;
    this.nodes = nodes;
  }
}
