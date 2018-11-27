import { load } from '../src/config';
import { expect } from 'chai';

describe('config.load', () => {
  const messages = [
    'Missing "rules"',  // 01.yml
    'Missing "rules"',  // 02.yml
    '"rules" must be a sequence',  // 03.yml
    'Every rule must be a map',  // 04.yml
    'Every rule must be a map',  // 05.yml
    '"id" must be a string (#1)',  // 06.yml
    'Missing "message" (sample)',  // 07.yml
    '"message" must be a string (sample)',  // 08.yml
    'Missing "pattern" (sample)',  // 09.yml
    '"pattern" must be a string or a string sequence (sample)',  // 10.yml
    'Every pattern must be a string (#1 in sample)',  // 11.yml
    '"tests" must be a map',  // 12.yml
    '"tests.match" must be a string or a string sequence (sample)',  // 13.yml
    'Every test must be a string (match #1, sample)',  // 14.yml
    'Invalid YAML',  // 15.yml
    'Missing "id" (#1)',  // 16.yml
  ];

  messages.forEach((msg, i) => {
    it('should throw an error', () => {
      const name = i < 9 ? `0${i + 1}` : `${i + 1}`;
      expect(() => load(`./test/res/yml/${name}.yml`)).to.throw(msg);
    });
  });

  it('should throw an error', () => {
    expect(() => load('non-existent')).to.throw('non-existent not found');
  });

  it('should throw an error', () => {
    expect(() => load('./test/res/yml/17.yml')).to.throw();
  });

});
