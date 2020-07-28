import * as ts from 'typescript';

export abstract class Node {
  abstract match(expr: ts.Node | undefined, typeChecker: ts.TypeChecker): boolean;
}

export const ELLIPSIS = 'ELLIPSIS';
