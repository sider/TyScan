import * as ts from 'typescript';
import { Node } from './node';

export class Wildcard extends Node {
  match(_: ts.Expression, __: ts.TypeChecker) {
    return true;
  }
}
