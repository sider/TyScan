"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
class Node {
}
exports.Node = Node;
class FunctionType extends Node {
    constructor(args, ret) {
        super();
        this.args = args;
        this.ret = ret;
    }
    match(type, typeChecker) {
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
exports.FunctionType = FunctionType;
class UnionType extends Node {
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
    constructor(node, dimension) {
        super();
        this.node = node;
        this.dimension = dimension;
    }
    match(type, typeChecker) {
        const typeNode = typeChecker.typeToTypeNode(type);
        if (typeNode === undefined) {
            return false;
        }
        if (typeNode.kind === ts.SyntaxKind.ArrayType) {
            if (0 < this.dimension) {
                const t = type.typeArguments[0];
                return this.node.match(t, typeChecker);
            }
            return false;
        }
        return this.dimension === 0 ? this.node.match(type, typeChecker) : false;
    }
}
exports.ArrayType = ArrayType;
class TupleType extends Node {
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
class Reference extends Node {
    constructor(module, name, args) {
        super();
        this.module = module;
        this.name = name;
        this.args = args;
    }
    match(type, typeChecker) {
        const node = typeChecker.typeToTypeNode(type);
        if (node === undefined) {
            return false;
        }
        const name = node.typeName;
        if (name === undefined) {
            return false;
        }
        const decl = type.symbol.valueDeclaration;
        return this.module.match(decl) && this.name === name.escapedText;
    }
}
exports.Reference = Reference;
class Module {
    constructor(path, namespaces) {
        this.path = path;
        this.namespaces = namespaces.map(s => s.slice(0, -1));
    }
    match(declaration) {
        if (this.namespaces.length === 0) {
            return true;
        }
        const nss = [];
        let d = declaration.parent;
        while (d !== undefined) {
            if (d.kind & ts.SyntaxKind.ModuleDeclaration) {
                const n = d.name;
                if (n !== undefined) {
                    nss.push(n.escapedText.toString());
                }
            }
            d = d.parent;
        }
        nss.reverse();
        if (0 < this.path.components.length) {
            return this.path.match(declaration.getSourceFile())
                && nss.length === this.namespaces.length
                && nss.every((s, i) => s === this.namespaces[i]);
        }
        if (nss.length < this.namespaces.length) {
            return false;
        }
        nss.reverse();
        return this.namespaces.slice().reverse().every((s, i) => s === nss[i]);
    }
}
exports.Module = Module;
class Path {
    constructor(components) {
        this.components = components.map(s => s.slice(0, -1));
    }
    match(sourceFile) {
        const path = sourceFile.fileName.split('.').slice(0, -1).join('.');
        if (path.startsWith('/')) {
            return false;
        }
        const ps = path.split('/');
        if (ps.length < this.components.length) {
            return false;
        }
        ps.reverse();
        return this.components.slice().reverse().every((s, i) => s === ps[i]);
    }
}
exports.Path = Path;
class Predefined extends Node {
    constructor(text) {
        super();
        this.text = text;
    }
    match(type, typeChecker) {
        if (this.text === 'any') {
            if (type.flags & ts.TypeFlags.Any) {
                return true;
            }
        }
        else if (this.text === 'number') {
            if (type.flags & ts.TypeFlags.NumberLike) {
                return true;
            }
        }
        else if (this.text === 'string') {
            if (type.flags & ts.TypeFlags.StringLike) {
                return true;
            }
        }
        else if (this.text === 'boolean') {
            if (type.flags & ts.TypeFlags.BooleanLike) {
                return true;
            }
        }
        else if (this.text === 'void') {
            if (type.flags & ts.TypeFlags.VoidLike) {
                return true;
            }
        }
        return false;
    }
}
exports.Predefined = Predefined;
//# sourceMappingURL=node.js.map