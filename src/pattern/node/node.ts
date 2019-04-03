import * as ts from 'typescript';

export abstract class Node {
  abstract match(expr: ts.Expression | undefined, typeChecker: ts.TypeChecker): boolean;
}
