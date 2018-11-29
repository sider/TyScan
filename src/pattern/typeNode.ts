import * as ts from 'typescript';

abstract class Node {
  abstract match(node: ts.Type, typeChecker: ts.TypeChecker): boolean;
}

export class FunctionType extends Node {
  constructor(readonly args: ReadonlyArray<UnionType>, readonly ret: UnionType) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
    const node = typeChecker.typeToTypeNode(type);
    if (node !== undefined) {
      if (node.kind & ts.SyntaxKind.FunctionType) {
        const sig = type.getCallSignatures()[0];
        return sig !== undefined
          && this.args.length === sig.parameters.length
          && this.args.every((a, i) => { 
            const t = typeChecker.getTypeAtLocation(sig.parameters[i].declarations[0]);
            return a.match(t, typeChecker);
          })
          && this.ret.match(sig.getReturnType(), typeChecker);
      }
    }
    return false;
  }
}

export class UnionType extends Node {
  constructor(readonly intersections: ReadonlyArray<IntersectionType>) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
    if (type.isUnion()) {
      const union = <ts.UnionType>type;
      return union.types.length === this.intersections.length
        && union.types.every((t, i) => this.intersections[i].match(t, typeChecker));
    }
    if (this.intersections.length === 1) {
      return this.intersections[0].match(type, typeChecker);
    }
    return false;
  }
}

export class IntersectionType extends Node {
  constructor(readonly arrays: ReadonlyArray<ArrayType>) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
    if (type.isIntersection()) {
      const intersection = <ts.IntersectionType>type;
      return intersection.types.length === this.arrays.length
        && intersection.types.every((t, i) => this.arrays[i].match(t, typeChecker));
    }
    if (this.arrays.length === 1) {
      return this.arrays[0].match(type, typeChecker);
    }
    return false;
  }
}

export class ArrayType extends Node {
  constructor(readonly primary: PrimaryType, readonly dimension: number) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
    if (typeChecker.typeToTypeNode(type)!.kind === ts.SyntaxKind.ArrayType) {
      if (0 < this.dimension) {
        const t = (<any>type).typeArguments[0] as ts.Type;
        return this.primary.match(t, typeChecker);
      } else {
        return false;
      }
    }
    return this.dimension === 0 ? this.primary.match(type, typeChecker) : false;
  }
}

export abstract class PrimaryType extends Node {
}

export class TupleType extends PrimaryType {
  constructor(readonly unions: ReadonlyArray<UnionType>) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
    if (typeChecker.typeToTypeNode(type)!.kind & ts.SyntaxKind.TupleType) {
      const args = (<any>type).typeArguments as ts.Type[];
      return args !== undefined
        && args.length === this.unions.length
        && args.every((a, i) => this.unions[i].match(a, typeChecker));
    }
    return false;
  }
}

export class AtomicType extends PrimaryType {
  constructor(
    readonly relative: boolean,
    readonly paths: string[],
    readonly modules: string[],
    readonly name: string,
    readonly args: ReadonlyArray<UnionType>,
  ) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
    if (type.flags & ts.TypeFlags.Any) {
      return this.name === 'any';
    }
    if (type.flags & ts.TypeFlags.NumberLike) {
      return this.name === 'number';
    }
    if (type.flags & ts.TypeFlags.BooleanLike) {
      return this.name === 'boolean';
    }
    if (type.flags & ts.TypeFlags.StringLike) {
      return this.name === 'string';
    }

    if (type.isTypeParameter()) {
      return false;
    }

    const node = typeChecker.typeToTypeNode(type);
    if (node !== undefined) {
      const name = (<any>node).typeName;
      if (name !== undefined) {
        return this.name === (<ts.Identifier>name).escapedText;
      }
    }
    return false;
  }
}
