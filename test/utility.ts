import { expect } from 'chai';
import { ScanCommand } from '../src/cli/subcommand/scanCommand';
import { TestCommand } from '../src/cli/subcommand/testCommand';

export function scan(name: string, expected: any) {
  const path = getResourcePath(name);
  const subj = buildSubject(expected);

  it(`should find ${subj} in ${path}`, () => {
    const config = `${path}/tyscan.yml`;
    const [ecode, json] = getScanOutputJson(path, config);

    expect(ecode).eql(0);
    expect(json.errors.length).eql(0);

    const actual = transformScanResult(json, path);
    expect(actual).eql(expected);
  });
}

export function scanError(name: string, expected: any) {
  const path = getResourcePath(name);

  it(`should throw an error in ${path}`, () => {
    const config = `${path}/tyscan.yml`;
    const [ecode, json] = getScanOutputJson(path, config);
    expect(ecode).eql(0);
    expect(json.errors).eql(expected);
  });
}

export function test(name: string, expected: number) {
  const path = getResourcePath(name);
  it(`should pass all pattern tests in ${path}`, () => {
    let output = '';
    const config = `${path}/tyscan.yml`;

    const command = new TestCommand();
    command.configure([], { config, json : true });
    command.stdout = (s: string) => { output = s; };

    const ecode = command.run();
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

function getScanOutputJson(path: string, config: string) {
  let output = '';

  const command = new ScanCommand();
  command.configure([path], { config, json: true });
  command.stdout = (s: string) => { output = s; };

  const ecode = command.run();
  return [ecode, JSON.parse(output)];
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
