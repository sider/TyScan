import * as cli from '../src/cli';
import { expect } from 'chai';

describe('scan', () => {
  scan('find-foo-calls', 'find three matches', {
    'find-foo-calls-1': {
      'sample.ts': [
        [[4, 1], [4, 7]],
        [[6, 1], [6, 10]],
      ],
    },
    'find-foo-calls-2': {
      'sample.ts': [
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

  scan('find-object-literals', 'find three matches', {
    'find-object-literals-1': {
      'sample.ts': [
        [[1, 14], [1, 30]],
        [[2, 14], [2, 48]],
      ],
    },
    'find-object-literals-2': {
      'sample.ts': [
        [[1, 14], [1, 30]],
      ],
    },
  });

  scan('find-function-literals', 'find two matches', {
    'find-function-literals-1': {
      'sample.ts': [
        [[5, 3], [5, 11]],
      ],
    },
    'find-function-literals-2': {
      'sample.ts': [
        [[6, 3], [6, 22]],
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
