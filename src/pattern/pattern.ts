import * as ts from 'typescript';
import { Expression } from './node';
import { SourceFile } from '../typescript/sourceFile';

export class Pattern {

  constructor(
    readonly expressions: ReadonlyArray<Expression>,
  ) {}

  *scan(srcFile: SourceFile, typeChecker: ts.TypeChecker) {
    for (const t of srcFile.getExpressions()) {
      if (this.expressions.some(e => e.match(t, typeChecker))) {
        yield t;
      }
    }
  }

}
