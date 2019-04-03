import * as ts from 'typescript';

export abstract class Node {
  abstract match(node: ts.Type, typeChecker: ts.TypeChecker): boolean;
}
