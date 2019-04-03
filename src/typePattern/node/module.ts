import * as ts from 'typescript';
import { Path } from './path';

export class Module {
  readonly namespaces: ReadonlyArray<string>;

  constructor(readonly path: Path, namespaces: ReadonlyArray<string>) {
    this.namespaces = namespaces.map(s => s.slice(0, -1));
  }

  match(declaration: ts.Declaration) {
    if (this.path.components.length !== 0) {
      if (!this.path.match(declaration.getSourceFile())) {
        return false;
      }
    }

    if (this.namespaces.length === 0) {
      return true;
    }

    const nss = <string[]>[];
    let d = declaration.parent;
    while (d !== undefined) {
      if (d.kind & ts.SyntaxKind.ModuleDeclaration) {
        const n = (<ts.ModuleDeclaration>d).name;
        if (n !== undefined) {
          nss.push((<ts.Identifier>n).escapedText.toString());
        }
      }
      d = d.parent;
    }
    nss.reverse();

    if (nss.length < this.namespaces.length) {
      return false;
    }

    nss.reverse();
    return this.namespaces.slice().reverse().every((s, i) => s === nss[i]);
  }
}
