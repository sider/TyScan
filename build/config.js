"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const yaml = require("js-yaml");
const compiler = require("./compiler");
const patternParser = require("./pattern/parser");
class Config {
    constructor(rules) {
        this.rules = rules;
    }
    *scan(paths) {
        for (const path of paths) {
            const result = compiler.compileFile(path);
            const matches = result.isSuccessful()
                ? new Map(this.rules.map(r => [r, r.scan(result)]))
                : undefined;
            yield new ScanResult(path, result, matches);
        }
    }
    *test() {
        for (const rule of this.rules) {
            yield* rule.test();
        }
    }
}
exports.Config = Config;
class Rule {
    constructor(id, message, pattern) {
        this.id = id;
        this.message = message;
        this.pattern = pattern;
        this.tests = [];
    }
    *scan(result) {
        yield* this.pattern.scan(result.srcFile, result.program.getTypeChecker());
    }
    *test() {
        for (const t of this.tests) {
            yield t.run();
        }
    }
}
exports.Rule = Rule;
class Test {
    constructor(rule, match, index, code) {
        this.rule = rule;
        this.match = match;
        this.index = index;
        this.code = code;
    }
    run() {
        const result = compiler.compileString(this.code);
        const success = result.isSuccessful()
            ? !this.rule.scan(result).next().done === this.match
            : undefined;
        return new TestResult(this, result, success);
    }
}
exports.Test = Test;
class ScanResult {
    constructor(path, compileResult, nodes) {
        this.path = path;
        this.compileResult = compileResult;
        this.nodes = nodes;
    }
}
exports.ScanResult = ScanResult;
class TestResult {
    constructor(test, compileResult, success) {
        this.test = test;
        this.compileResult = compileResult;
        this.success = success;
    }
}
exports.TestResult = TestResult;
function load(path) {
    let txt;
    try {
        txt = fs.readFileSync(path).toString();
    }
    catch (_a) {
        throw new Error(`${path} not found`);
    }
    let obj;
    try {
        obj = yaml.safeLoad(txt, { schema: yaml.FAILSAFE_SCHEMA });
    }
    catch (_b) {
        throw new Error('Invalid YAML');
    }
    return loadConfig(obj);
}
exports.load = load;
function loadConfig(obj) {
    if (obj === undefined || obj === null || obj.rules === undefined) {
        throw new Error('Missing "rules"');
    }
    const rules = obj.rules;
    if (!(rules instanceof Array)) {
        throw new Error('"rules" must be a sequence');
    }
    return new Config(rules.map((o, i) => loadRule(o, i)));
}
function loadRule(obj, idx) {
    if (obj === null || typeof obj !== 'object') {
        throw new Error('Every rule must be a map');
    }
    const id = obj.id;
    if (id === undefined) {
        throw new Error(`Missing "id" (#${idx + 1})`);
    }
    if (typeof id !== 'string') {
        throw new Error(`"id" must be a string (#${idx + 1})`);
    }
    const message = obj.message;
    if (message === undefined) {
        throw new Error(`Missing "message" (${id})`);
    }
    if (typeof message !== 'string') {
        throw new Error(`"message" must be a string (${id})`);
    }
    const tests = { match: undefined, unmatch: undefined };
    if (obj.tests === null) {
        throw new Error('"tests" must be a map');
    }
    if (obj.tests !== undefined) {
        tests.match = obj.tests.match;
        tests.unmatch = obj.tests.unmatch;
    }
    const pattern = loadPattern(obj.pattern, id);
    const rule = new Rule(id, message, pattern);
    rule.tests.push(...loadTestSuite(tests.match, true, rule));
    rule.tests.push(...loadTestSuite(tests.unmatch, false, rule));
    return rule;
}
function loadPattern(obj, ruleId) {
    if (obj === undefined) {
        throw new Error(`Missing "pattern" (${ruleId})`);
    }
    if (typeof obj === 'string') {
        return parsePattern([obj], ruleId);
    }
    if (obj instanceof Array) {
        obj.forEach((o, i) => {
            if (typeof o !== 'string') {
                throw new Error(`Every pattern must be a string (#${i + 1} in ${ruleId})`);
            }
        });
        return parsePattern(obj, ruleId);
    }
    throw new Error(`"pattern" must be a string or a string sequence (${ruleId})`);
}
function parsePattern(strs, ruleId) {
    try {
        return patternParser.parse(strs);
    }
    catch (e) {
        throw new Error(`Invalid pattern (#${e.index + 1} in ${ruleId}): ${e.message}`);
    }
}
function loadTestSuite(obj, match, rule) {
    const kind = match ? 'match' : 'unmatch';
    if (obj === undefined) {
        return [];
    }
    if (typeof obj === 'string') {
        return [new Test(rule, match, 1, obj)];
    }
    if (obj instanceof Array) {
        return obj.map((o, i) => {
            if (typeof o !== 'string') {
                throw new Error(`Every test must be a string (${kind} #${i + 1}, ${rule.id})`);
            }
            return new Test(rule, match, i, o);
        });
    }
    throw new Error(`"tests.${kind}" must be a string or a string sequence (${rule.id})`);
}
//# sourceMappingURL=config.js.map