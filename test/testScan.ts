import * as cli from '../src/cli';
import { expect } from 'chai';

describe('scan', () => {
  scan('find-foo-calls', 'find two matches', {
    'find-foo-calls': {
      'sample.ts': [
        [[4, 1], [4, 7]],
        [[6, 1], [6, 10]],
      ],
    },
  });

  scan('find-foo-calls-with-type-spec', 'find one match', {
    'find-foo-calls-with-type-spec': {
      'sample.ts': [
        [[4, 1], [4, 7]],
      ],
    },
  });

  scan('find-bar-method-calls', 'find one match', {
    'find-bar-method-calls': {
      'sample.ts': [
        [[9, 1], [9, 17]],
      ],
    },
  });

  scan('negation', 'find one match', {
    negation: {
      'sample.ts': [
        [[12, 1], [12, 10]],
      ],
    },
  });
});

function scan(name: string, desc: string, expected: any) {
  const path = `test/res/${name}`;
  it(`should ${desc} in ${path}`, () => {
    let output = '';
    const config = `${path}/tyscan.yml`;
    const ecode = cli.scan([path], config, true, false, (s) => { output = s; }, console.error);
    const json = JSON.parse(output);

    expect(ecode).eql(0);
    expect(json.errors.length).eql(0);

    const actual = {} as any;
    for (const match of json.matches) {
      const rule = match.rule.id;
      const file = match.path.replace(`${path}/`, '');
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

    expect(actual).eql(expected);
  });
}
