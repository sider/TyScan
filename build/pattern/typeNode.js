"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
class Node {
}
class TopLevelType extends Node {
}
exports.TopLevelType = TopLevelType;
class FunctionType extends TopLevelType {
    constructor(args, ret) {
        super();
        this.args = args;
        this.ret = ret;
    }
    match(type, typeChecker) {
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
exports.FunctionType = FunctionType;
class UnionType extends TopLevelType {
    constructor(intersections) {
        super();
        this.intersections = intersections;
    }
    match(type, typeChecker) {
        if (type.isUnion()) {
            const union = type;
            return union.types.length === this.intersections.length
                && union.types.every((t, i) => this.intersections[i].match(t, typeChecker));
        }
        if (this.intersections.length === 1) {
            return this.intersections[0].match(type, typeChecker);
        }
        return false;
    }
}
exports.UnionType = UnionType;
class IntersectionType extends Node {
    constructor(arrays) {
        super();
        this.arrays = arrays;
    }
    match(type, typeChecker) {
        if (type.isIntersection()) {
            const intersection = type;
            return intersection.types.length === this.arrays.length
                && intersection.types.every((t, i) => this.arrays[i].match(t, typeChecker));
        }
        if (this.arrays.length === 1) {
            return this.arrays[0].match(type, typeChecker);
        }
        return false;
    }
}
exports.IntersectionType = IntersectionType;
class ArrayType extends Node {
    constructor(primary, dimension) {
        super();
        this.primary = primary;
        this.dimension = dimension;
    }
    match(type, typeChecker) {
        if (typeChecker.typeToTypeNode(type).kind === ts.SyntaxKind.ArrayType) {
            if (0 < this.dimension) {
                const t = type.typeArguments[0];
                return this.primary.match(t, typeChecker);
            }
            else {
                return false;
            }
        }
        return this.dimension === 0 ? this.primary.match(type, typeChecker) : false;
    }
}
exports.ArrayType = ArrayType;
class PrimaryType extends Node {
}
exports.PrimaryType = PrimaryType;
class TupleType extends PrimaryType {
    constructor(types) {
        super();
        this.types = types;
    }
    match(type, typeChecker) {
        if (typeChecker.typeToTypeNode(type).kind & ts.SyntaxKind.TupleType) {
            const args = type.typeArguments;
            return args !== undefined
                && args.length === this.types.length
                && args.every((a, i) => this.types[i].match(a, typeChecker));
        }
        return false;
    }
}
exports.TupleType = TupleType;
class ObjectType extends Node {
    constructor(attrs, open) {
        super();
        this.attrs = attrs;
        this.open = open;
    }
    match(type, typeChecker) {
        if (typeChecker.typeToString(type).startsWith('{')) {
            const members = type.members;
            for (const [ak, at] of this.attrs) {
                if (!members.has(ak)) {
                    return false;
                }
                const et = members.get(ak).type;
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
exports.ObjectType = ObjectType;
class AtomicType extends PrimaryType {
    constructor(relative, paths, modules, name, args) {
        super();
        this.relative = relative;
        this.paths = paths;
        this.modules = modules;
        this.name = name;
        this.args = args;
    }
    match(type, typeChecker) {
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
            const name = node.typeName;
            if (name !== undefined) {
                return this.name === name.escapedText;
            }
        }
        return false;
    }
}
exports.AtomicType = AtomicType;
//# sourceMappingURL=typeNode.js.map