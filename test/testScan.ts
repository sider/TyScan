import { scan } from './utility';

describe('scan', () => {
  scan('find-foo-calls', {
    'find-foo-calls-1': {
      'sample.ts': [
        [[4, 1], [4, 6]],
        [[6, 1], [6, 7]],
        [[8, 1], [8, 10]],
      ],
    },
    'find-foo-calls-2': {
      'sample.ts': [
        [[8, 1], [8, 10]],
      ],
    },
    'find-foo-calls-3': {
      'sample.ts': [
        [[6, 1], [6, 7]],
        [[8, 1], [8, 10]],
      ],
    },
  });

  scan('find-foo-calls-with-type-spec', {
    'find-foo-calls-with-type-spec-1': {
      'sample.ts': [
        [[4, 1], [4, 7]],
      ],
    },
    'find-foo-calls-with-type-spec-2': {
      'sample.ts': [
        [[6, 1], [6, 21]],
        [[8, 1], [8, 21]],
      ],
    },
    'find-foo-calls-with-type-spec-3': {
      'sample.ts': [
        [[6, 1], [6, 21]],
      ],
    },
  });

  scan('find-bar-method-calls', {
    'find-bar-method-calls': {
      'sample.ts': [
        [[9, 1], [9, 17]],
      ],
    },
  });

  scan('negation', {
    negation: {
      'sample.ts': [
        [[12, 1], [12, 10]],
      ],
    },
  });

  scan('find-object-literals', {
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

  scan('find-function-literals', {
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

  scan('find-user-types', {
    'find-user-types-1': {
      'sample1.ts': [[[3, 1], [3, 8]]],
      'sample2.ts': [[[5, 1], [5, 11]]],
      'sample3.ts': [[[3, 1], [3, 8]]],
      'sample4.ts': [[[3, 1], [3, 11]]],
    },
    'find-user-types-2': {
      'sample2.ts': [[[5, 1], [5, 11]]],
      'sample4.ts': [[[3, 1], [3, 11]]],
    },
    'find-user-types-3': {
      'sample3.ts': [[[3, 1], [3, 8]]],
    },
    'find-user-types-4': {
      'sample4.ts': [[[3, 1], [3, 11]]],
    },
  });

    scan('find-assignment', {
    'find-assignment': {
      'sample.ts': [
        [[10, 1], [10, 14]],
      ],
    }
  });
});
