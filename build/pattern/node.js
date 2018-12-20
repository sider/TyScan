"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
class Node {
}
class Expression extends Node {
    constructor(terms) {
        super();
        this.terms = terms;
    }
    match(expr, typeChecker) {
        return this.terms.some(t => t.match(expr, typeChecker));
    }
}
exports.Expression = Expression;
class Term extends Node {
    constructor(factors) {
        super();
        this.factors = factors;
    }
    match(expr, typeChecker) {
        return this.factors.every(f => f.match(expr, typeChecker));
    }
}
exports.Term = Term;
class Factor extends Node {
    constructor(node, type) {
        super();
        this.node = node;
        this.type = type;
    }
    match(expr, typeChecker) {
        if (this.node.match(expr, typeChecker)) {
            const t = typeChecker.getTypeAtLocation(expr);
            if (this.type === undefined || this.type.match(t, typeChecker)) {
                return true;
            }
        }
        return false;
    }
}
exports.Factor = Factor;
class Element extends Node {
    constructor(receiver, atom) {
        super();
        this.receiver = receiver;
        this.atom = atom;
    }
    match(expr, typeChecker) {
        if (this.receiver === undefined) {
            return this.atom.match(expr, typeChecker);
        }
        if (ts.isPropertyAccessExpression(expr)) {
            return this.atom.match(expr.name, typeChecker)
                && this.receiver.match(expr.expression, typeChecker);
        }
        return false;
    }
}
exports.Element = Element;
class Not extends Node {
    constructor(node) {
        super();
        this.node = node;
    }
    match(expr, typeChecker) {
        return !this.node.match(expr, typeChecker);
    }
}
exports.Not = Not;
class Wildcard extends Node {
    match(_, __) {
        return true;
    }
}
exports.Wildcard = Wildcard;
class Identifier extends Node {
    constructor(name) {
        super();
        this.name = name;
    }
    match(expr, typeChecker) {
        if (ts.isIdentifier(expr)) {
            return expr.escapedText === this.name;
        }
        return false;
    }
}
exports.Identifier = Identifier;
class Call extends Node {
    constructor(elem, args) {
        super();
        this.elem = elem;
        this.args = args;
    }
    match(expr, typeChecker) {
        if (ts.isCallExpression(expr)) {
            const ce = expr;
            return this.elem.match(ce.expression, typeChecker)
                && this.matchArgs(ce.arguments, typeChecker);
        }
        return false;
    }
    matchArgs(exprs, typeChecker) {
        if (this.args.every(a => a !== undefined)) {
            return this.args.length === exprs.length
                && this.args.every((a, i) => a.match(exprs[i], typeChecker));
        }
        let [argIdx, exprIdx] = [0, 0];
        while (argIdx < this.args.length && exprIdx < exprs.length) {
            const a = this.args[argIdx];
            const e = exprs[exprIdx];
            if (a === undefined) {
                if (argIdx === this.args.length - 1) {
                    return true;
                }
                const aNext = this.args[argIdx + 1];
                if (aNext.match(e, typeChecker)) {
                    argIdx += 2;
                }
                exprIdx += 1;
            }
            else {
                if (a.match(e, typeChecker)) {
                    argIdx += 1;
                    exprIdx += 1;
                }
                else {
                    return false;
                }
            }
        }
        return exprIdx === exprs.length;
    }
}
exports.Call = Call;
//# sourceMappingURL=node.js.map