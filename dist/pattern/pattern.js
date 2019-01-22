"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
class Pattern {
    constructor(expressions) {
        this.expressions = expressions;
    }
    *scan(srcFile, typeChecker) {
        for (const t of findTargets(srcFile)) {
            if (this.expressions.some(e => e.match(t, typeChecker))) {
                yield t;
            }
        }
    }
}
exports.Pattern = Pattern;
function* findTargets(node) {
    if (isExpressionNode(node)) {
        yield node;
    }
    for (const n of node.getChildren()) {
        yield* findTargets(n);
    }
}
// Internal API
const isExpressionNode = ts.isExpressionNode;
//# sourceMappingURL=pattern.js.map