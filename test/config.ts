import { load } from '../src/config';
import { expect } from 'chai';

describe('config.load', () => {
  it('should load successfully', () => {
    const config = load('./test/res/yml/sample.yml');
    expect(config.rules.length).eq(3);  // TODO: check each rule
  });

  it('should load successfully', () => {
    const config = load('./test/res/yml/sample.yml');
    const testResults = Array.from(config.test());
    expect(testResults.filter(r => r.success === true).length).eq(2);
    expect(testResults.filter(r => r.success === false).length).eq(0);
    expect(testResults.filter(r => r.success === undefined).length).eq(0);

    const scanResult = Array.from(config.scan(['test/res/ts/sample.ts']))[0]!;
    expect(scanResult.nodes!.size).eq(3);
  });

});

describe('config.load errors', () => {
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
    it(`should throw an error: ${msg}`, () => {
      const name = i < 9 ? `0${i + 1}` : `${i + 1}`;
      expect(() => load(`./test/res/yml/error/${name}.yml`)).to.throw(msg);
    });
  });

  it('should throw an error: File not found', () => {
    expect(() => load('non-existent')).to.throw('non-existent not found');
  });

  it('should throw an error: Parse error', () => {
    expect(() => load('./test/res/yml/error/17.yml')).to.throw();
  });

});
