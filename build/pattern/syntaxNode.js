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
    match(node, typeChecker) {
        return this.terms.some(t => t.match(node, typeChecker));
    }
}
exports.Expression = Expression;
class Term extends Node {
    constructor(factors) {
        super();
        this.factors = factors;
    }
    match(node, typeChecker) {
        return this.factors.every(f => f.match(node, typeChecker));
    }
}
exports.Term = Term;
class Factor extends Node {
}
exports.Factor = Factor;
class NotFactor extends Factor {
    constructor(factor) {
        super();
        this.factor = factor;
    }
    match(node, typeChecker) {
        return !this.factor.match(node, typeChecker);
    }
}
exports.NotFactor = NotFactor;
class ParenedExpression extends Factor {
    constructor(expression) {
        super();
        this.expression = expression;
    }
    match(node, typeChecker) {
        return this.expression.match(node, typeChecker);
    }
}
exports.ParenedExpression = ParenedExpression;
class Wildcard extends Factor {
    constructor(type) {
        super();
        this.type = type;
    }
    match(expr, typeChecker) {
        if (this.type === undefined) {
            return true;
        }
        const type = typeChecker.getTypeAtLocation(expr);
        return this.type.match(type, typeChecker);
    }
}
exports.Wildcard = Wildcard;
class Null extends Factor {
    match(expr, _) {
        if (expr.kind === ts.SyntaxKind.NullKeyword) {
            if (!ts.isExpression(expr.parent)) {
                return true;
            }
        }
        return false;
    }
}
exports.Null = Null;
class Undefined extends Factor {
    match(expr, _) {
        if (expr.kind === ts.SyntaxKind.Identifier) {
            const id = expr;
            if (id.originalKeywordKind && id.originalKeywordKind === ts.SyntaxKind.UndefinedKeyword) {
                return true;
            }
        }
        return false;
    }
}
exports.Undefined = Undefined;
//# sourceMappingURL=syntaxNode.js.map