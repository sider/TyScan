import * as ts from 'typescript';

export abstract class Node {
  abstract match(node: ts.Type, typeChecker: ts.TypeChecker): boolean;
}

export class FunctionType extends Node {
  constructor(readonly args: ReadonlyArray<Node>, readonly ret: Node) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
    const node = typeChecker.typeToTypeNode(type);
    if (node !== undefined && node.kind & ts.SyntaxKind.FunctionType) {
      const sig = type.getCallSignatures()[0];
      return sig !== undefined
        && this.args.length === sig.parameters.length
        && this.args.every((a, i) => {
          const t = typeChecker.getTypeAtLocation(sig.parameters[i].declarations[0]);
          return a.match(t, typeChecker);
        })
        && this.ret.match(sig.getReturnType(), typeChecker);
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
  constructor(readonly node: Node, readonly dimension: number) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
    if (typeChecker.typeToTypeNode(type)!.kind === ts.SyntaxKind.ArrayType) {
      if (0 < this.dimension) {
        const t = (<any>type).typeArguments[0] as ts.Type;
        return this.node.match(t, typeChecker);
      }
      return false;
    }
    return this.dimension === 0 ? this.node.match(type, typeChecker) : false;
  }
}

export class TupleType extends Node {
  constructor(readonly types: ReadonlyArray<Node>) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
    if (typeChecker.typeToTypeNode(type)!.kind & ts.SyntaxKind.TupleType) {
      const args = (<any>type).typeArguments as ts.Type[];
      return args !== undefined
        && args.length === this.types.length
        && args.every((a, i) => this.types[i].match(a, typeChecker));
    }
    return false;
  }
}

export class ObjectType extends Node {
  constructor(readonly attrs: ReadonlyMap<string, Node>, readonly open: boolean) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
    if (typeChecker.typeToString(type).startsWith('{')) {
      const members = (<any>type).members as Map<string, ts.Symbol>;
      for (const [ak, at] of this.attrs) {
        if (!members.has(ak)) {
          return false;
        }
        const et = (<any>members.get(ak)).type;
        if (!at.match(et, typeChecker)) {
          return false;
        }
      }
      if (this.open && this.attrs.size <= members.size) {
        return true;
      }
      if (!this.open && this.attrs.size === members.size) {
        return true;
      }
    }
    return false;
  }
}

export class Reference extends Node {
  constructor(
    readonly module: Module,
    readonly name: string,
    readonly args: ReadonlyArray<Node>,
  ) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
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

export class Module {
  constructor(readonly path: Path, readonly namespaces: ReadonlyArray<string>) {}
}

export class Path {
  constructor(readonly components: ReadonlyArray<string>) {}
}

export class Predefined extends Node {
  constructor(readonly text: string) { super(); }

  match(type: ts.Type, typeChecker: ts.TypeChecker) {
    if (this.text === 'any') {
      if (type.flags & ts.TypeFlags.Any) {
        return true;
      }
    } else if (this.text === 'number') {
      if (type.flags & ts.TypeFlags.NumberLike) {
        return true;
      }
    } else if (this.text === 'string') {
      if (type.flags & ts.TypeFlags.StringLike) {
        return true;
      }
    } else if (this.text === 'boolean') {
      if (type.flags & ts.TypeFlags.BooleanLike) {
        return true;
      }
    } else if (this.text === 'void') {
      if (type.flags & ts.TypeFlags.VoidLike) {
        return true;
      }
    }
    return false;
  }
}
