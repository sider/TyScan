import * as ts from 'typescript';

export class Path {
  readonly components: ReadonlyArray<string>;

  constructor(components: ReadonlyArray<string>) {
    this.components = components.map(s => s.slice(0, -1));
  }

  match(sourceFile: ts.SourceFile) {
    const ps = sourceFile.fileName.split('.').slice(0, -1).join('.').split('/');
    if (ps.length < this.components.length) {
      return false;
    }

    ps.reverse();
    return this.components.slice().reverse().every((s, i) => s === ps[i]);
  }
}
