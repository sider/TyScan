import { Expression } from './node/expression';
import { SourceFile } from '../typescript/sourceFile';

export class Pattern {

  constructor(
    readonly expressions: ReadonlyArray<Expression>,
  ) {}

  *scan(srcFile: SourceFile) {
    for (const t of srcFile.getExpressions()) {
      if (this.expressions.some(e => e.match(t, srcFile.getTypeChecker()))) {
        yield t;
      }
    }
  }

}
