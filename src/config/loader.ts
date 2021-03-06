import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as patternParser from '../pattern/parser';
import { Config } from './config';
import { Rule } from './rule';
import { Test } from './test';

export function load(path: string, tsconfigPath: string) {
  let txt;
  try {
    txt = fs.readFileSync(path).toString();
  } catch {
    throw new Error(`${path} not found`);
  }

  let obj;
  try {
    obj = yaml.safeLoad(txt, { schema: yaml.FAILSAFE_SCHEMA });
  } catch {
    throw new Error('Invalid YAML');
  }

  return loadConfig(obj, tsconfigPath);
}

function loadConfig(obj: any, tsconfigPath: string) {
  if (obj === undefined || obj === null || obj.rules === undefined) {
    throw new Error('Missing "rules"');
  }

  const rules = obj.rules;
  if (!(rules instanceof Array)) {
    throw new Error('"rules" must be a sequence');
  }

  return new Config(rules.map((o, i) => loadRule(o, i, tsconfigPath)));
}

function loadRule(obj: any, idx: number, tsconfigPath: string) {
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

  const justification: string | undefined = obj.justification;
  if (justification !== undefined && typeof justification !== 'string') {
    throw new Error(`"justification" must be a string (${id})`);
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
  const rule = new Rule(id, message, pattern, justification);

  rule.tests.push(...loadTestSuite(tests.match, true, rule, tsconfigPath));
  rule.tests.push(...loadTestSuite(tests.unmatch, false, rule, tsconfigPath));

  return rule;
}

function loadPattern(obj: any, ruleId: string) {
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

function parsePattern(strs: string[], ruleId: string) {
  try {
    return patternParser.parse(strs);
  } catch (e) {
    throw new Error(`Invalid pattern (#${e.index + 1} in ${ruleId}): ${e.message}`);
  }
}

function loadTestSuite(obj: any, match: boolean, rule: Rule, tsconfigPath: string) {
  const kind = match ? 'match' : 'unmatch';

  if (obj === undefined) {
    return [];
  }

  if (typeof obj === 'string') {
    return [new Test(rule, match, 1, obj, tsconfigPath)];
  }

  if (obj instanceof Array) {
    return obj.map((o, i) => {
      if (typeof o !== 'string') {
        throw new Error(`Every test must be a string (${kind} #${i + 1}, ${rule.id})`);
      }
      return new Test(rule, match, i, o, tsconfigPath);
    });
  }

  throw new Error(`"tests.${kind}" must be a string or a string sequence (${rule.id})`);
}
