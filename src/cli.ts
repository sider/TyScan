import * as fg from 'fast-glob';
import * as fs from 'fs';
import * as loader from './loader';
import * as result from './result';
import * as compiler from './compiler';

export function scan(srcPaths: string[], configPath: string, jsonOutput: boolean) {

  const paths = srcPaths
    .filter(p => fs.existsSync(p))
    .map(p => fs.statSync(p).isDirectory ? fg.sync(`${p}/**/*.ts`).map(e => e.toString()) : [p])
    .reduce((acc, paths) => acc.concat(paths));

  const config = loader.load(configPath);

  const output = { matches: <result.scan.Match[]>[], errors: <compiler.CompileError[]>[] };

  const ecode = 0;

  for (const result of config.scan(paths)) {
    for (const error of result.errors) {
      if (jsonOutput) {
        output.errors.push(error);
      } else {
        const loc = error.file ? `${error.file}#L${error.line}C${error.char}` : '';
        console.error(`${loc}: ${error.message}`);
      }
    }

    if (result.matches !== undefined) {
      for (const match of result.matches) {
        for (const range of match.ranges) {
          if (jsonOutput) {
            output.matches.push(match);
          } else {
            const loc = `${result.path}#L${range.begin.line}C${range.begin.char}`;
            const raw = '__code__';
            const msg = `${match.rule.message} (${match.rule.id})`;
            console.log(`${loc}\t${raw}\t${msg}`);
          }
        }
      }
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(output));
  }

  return ecode;

}

export function test(configPath: string) {

  const config = loader.load(configPath);

  const count = { success: 0, failure: 0, skipped: 0 };

  for (const result of config.test()) {
    const testId = `#${result.test.index + 1} (${result.test.rule.id})`;

    if (result.success === true) {
      count.success += 1;

    } else if (result.success === false) {
      count.failure += 1;

      if (result.test.match) {
        console.log(`No match found in match test ${testId}`);
      } else {
        console.log(`Match found in unmatch test ${testId}`);
      }

    } else {
      count.skipped += 1;

      const kind = result.test.match ? 'match' : 'unmatch';
      console.log(`Skipped ${kind} test ${testId}`);

    }
  }

  console.log(`Success: ${count.success} test(s)`);
  console.log(`Failure: ${count.failure} test(s)`);
  console.log(`Skipped: ${count.skipped} test(s)`);
  return (count.failure + count.skipped) ? 1 : 0;

}
