import { parse } from '../../src/pattern/parser';
import { expect } from 'chai';

describe('pattern parser', () => {

  const patterns = [
    "_",
    "_ || _",
    "_ && _",
    "!_",
    "(_)",
    "_ || _ && _",
    "_ || _ && !_",
    "(_ || _) && !_"
  ];

  for (const pattern of patterns) {
    it('should parse successfully', () => {
      const p = parse([pattern]);
      expect(p).to.not.be.null;  // TODO: check each rule
    });
  }

});