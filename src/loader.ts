import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { Config, Rule, Pattern, TestSuite } from './config';

export function load(path: string) {
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

  return loadConfig(obj);
}

function loadConfig(obj: any) {
  if (obj === undefined || obj.rules === undefined) {
    throw new Error('Missing "rules"');
  }

  const rules = obj.rules;
  if (!(rules instanceof Array)) {
    throw new Error('"rules" must be a sequence');
  }

  return new Config(rules.map((o, i) => loadRule(o, i)));
}

function loadRule(obj: any, idx: number) {
  if (obj === null) {
    throw new Error('"rules" must be a sequence');
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
    throw new Error(`"tests" must be a map`);
  }
  if (obj.tests !== undefined) {
    tests.match = obj.tests.match;
    tests.unmatch = obj.tests.unmatch;
  }

  const pattern = loadPattern(obj.pattern, id);

  const matchTests = loadTestSuite(tests.match, 'match', id);
  const unmatchTests = loadTestSuite(tests.unmatch, 'unmatch', id);

  return new Rule(id, message, pattern, matchTests, unmatchTests);
}

function loadPattern(obj: any, ruleId: string) {
  if (typeof obj === 'string') {
    return new Pattern();

  } else if (obj instanceof Array) {
    obj.forEach((o, i) => {
      if (typeof o !== 'string') {
        throw new Error(`Every pattern must be a string (#${i + 1} in ${ruleId})`);
      }
    });
    return new Pattern();

  } else {
    throw new Error(`"pattern" must be a string or a string sequence (${ruleId})`);
  }
}

function loadTestSuite(obj: any, kind: 'match' | 'unmatch', ruleId: string) {
  if (obj === undefined) {
    return new TestSuite([]);

  } else {
    if (typeof obj === 'string') {
      return new TestSuite([obj]);

    } else if (obj instanceof Array) {
      obj.forEach((o, i) => {
        if (typeof o !== 'string') {
          throw new Error(`Every test must be a string (${kind} #${i + 1}, ${ruleId})`);
        }
      });
      return new TestSuite(obj);

    } else {
      throw new Error(`"tests.${kind}" must be a string or a string sequence (${ruleId})"`);

    }
  }
}
