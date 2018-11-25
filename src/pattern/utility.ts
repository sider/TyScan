import * as ts from 'typescript';

export function getFullQualifiedName(node: ts.Node, typeChecker: ts.TypeChecker) {
  const ids = Array.from(findNodesByKind(node, ts.SyntaxKind.Identifier));
  const idStrs = ids.map(i => i.getText());

  const symbol = typeChecker.getSymbolAtLocation(ids[0]);

  if (symbol !== undefined && (symbol.flags & ts.SymbolFlags.Alias)) {
    const original = typeChecker.getAliasedSymbol(symbol);
    const fileName = original.getDeclarations()![0].getSourceFile().fileName;
    const relName = fileName.replace(/\.ts$/, '').replace(new RegExp(`^${process.cwd()}`), '.');
    if (original.name.startsWith('"/')) {
      idStrs[0] = relName;
    } else {
      idStrs[0] = `${relName}.${symbol.getDeclarations()![0].getChildAt(0).getText()}`;
    }
  }

  return idStrs.join('.');
}

export function *findNodesByKind(node: ts.Node, ...kinds: ts.SyntaxKind[]): Iterable<ts.Node> {
  if (kinds.some(k => k === node.kind)) {
    yield node;
  }
  for (const n of node.getChildren()) {
    yield * findNodesByKind(n, ...kinds);
  }
}
