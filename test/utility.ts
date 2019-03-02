import * as cli from '../src/cli';
import { expect } from 'chai';

export function scan(name: string, expected: any) {
  const path = getResourcePath(name);
  const subj = buildSubject(expected);

  it(`should find ${subj} in ${path}`, () => {
    let output = '';
    const config = `${path}/tyscan.yml`;
    const ecode = cli.scan([path], config, true, false, (s) => { output = s; }, console.error);
    const json = JSON.parse(output);

    expect(ecode).eql(0);
    expect(json.errors.length).eql(0);

    const actual = transformScanResult(json, path);
    expect(actual).eql(expected);
  });
}

export function test(name: string, expected: number) {
  const path = getResourcePath(name);
  it(`should pass all pattern tests in ${path}`, () => {
    let output = '';
    const config = `${path}/tyscan.yml`;
    const ecode = cli.test(config, true, (s) => { output = s; }, console.error);
    const json = JSON.parse(output);

    expect(json.summary.success).eql(expected);
    expect(json.summary.failure).eql(0);
    expect(json.summary.skipped).eql(0);
    expect(ecode).eql(0);
  });
}

function getResourcePath(name: string) {
  return `test/res/${name}`;
}

function buildSubject(expected: any) {
  const count = countMatches(expected);
  if (count === 0 || count === 1) {
    return `${count} match`;
  }
  return `${count} matches`;
}

function countMatches(expected: any) {
  let count = 0;
  for (const r in expected) {
    for (const f in expected[r]) {
      count += expected[r][f].length;
    }
  }
  return count;
}

function transformScanResult(json: any, basePath: string) {
  const actual = {} as any;
  for (const match of json.matches) {
    const rule = match.rule.id;
    const file = match.path.replace(`${basePath}/`, '');
    const start = match.location.start;
    const end = match.location.end;

    if (actual[rule] === undefined) {
      actual[rule] = {};
    }
    if (actual[rule][file] === undefined) {
      actual[rule][file] = [];
    }
    actual[rule][file].push([start, end]);
  }
  return actual;
}
