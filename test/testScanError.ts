import { scanError } from './utility';

describe('scan (error)', () => {
  scanError('ts-parse-error', [
    {
      location: [2, 1],
      message: "'}' expected.",
      path: 'test/res/ts-parse-error/broken.ts',
    },
  ]);
});
