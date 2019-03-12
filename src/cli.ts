import * as fg from 'fast-glob';
import * as fs from 'fs';
import * as ts from 'typescript';
import * as tmp from 'tmp';
import * as readline from 'readline-sync';
import * as config from './config';
import { COPYFILE_EXCL } from 'constants';

export function init() {
  fs.copyFileSync(`${__dirname}/../sample/tyscan.yml`, 'tyscan.yml', COPYFILE_EXCL);
  return 0;
}

export function console_(srcPaths: string[]) {
  console.log('TyScan interactive console:');
  readline.promptLoop(pattern => promptLoop(srcPaths, pattern), { prompt: 'pattern> ' });
  return 0;
}

function promptLoop(srcPaths: string[], pattern: string) {
  if (pattern.trim().length === 0) {
    return false;
  }

  const tmpfile = tmp.fileSync();
  try {
    const p = pattern.replace(/"/g, '\\"');
    const content = `rules:\n  - id: ""\n    message: ""\n    pattern: "${p}"\n`;
    fs.writeFileSync(tmpfile.name, content);

    const paths = findTSFiles(srcPaths);
    scan(
      paths,
      tmpfile.name,
      false,
      false,
      (s) => { console.log(s.split('\t').slice(0, 2).join('\t')); },
      (s) => { console.log(`\x1b[31m${s}\x1b[0m`); },
    );

  } catch (e) {
    console.error(`${e.stack}`);
  } finally {
    tmpfile.removeCallback();
  }
  return false;
}

export function scan(
  srcPaths: string[],
  configPath: string,
  jsonOutput: boolean,
  verboseOutput: boolean,
  stdout: (s: string) => void,
  stderr: (s: string) => void) {

  const paths = findTSFiles(srcPaths);

  const output = { matches: <any[]>[], errors: <any[]>[] };

  const ecode = 0;

  const targetFileCount = paths.length;
  let scannedFileCount = 0;
  for (const result of config.load(configPath).scan(paths)) {
    const src = result.compileResult.srcFile;

    scannedFileCount += 1;
    if (verboseOutput) {
      stdout(`Scanning ${src.fileName} (${scannedFileCount}/${targetFileCount})`);
    }

    if (result.nodes !== undefined) {
      for (const [rule, nodes] of result.nodes) {
        for (const node of nodes) {
          const start = ts.getLineAndCharacterOfPosition(src, node.getStart());

          if (jsonOutput) {
            const end = ts.getLineAndCharacterOfPosition(src, node.end);

            output.matches.push({
              rule: { id: rule.id, message: rule.message },
              path: result.path,
              location: {
                start: [start.line + 1, start.character + 1],
                end: [end.line + 1, end.character + 1],
              },
            });

          } else {
            const loc = `${result.path}#L${start.line + 1}C${start.character + 1}`;
            const msg = `${rule.message} (${rule.id})`;
            const txt = `${loc}\t${node.getText()}\t${msg}`;
            if (verboseOutput) {
              stderr(`\x1b[31m${txt}\x1b[0m`);
            } else {
              stdout(`${txt}`);
            }

          }
        }
      }
    } else {
      const diags = result.compileResult.program.getSyntacticDiagnostics(src);

      for (const diag of diags) {
        const start = ts.getLineAndCharacterOfPosition(src, diag.start);
        const msg = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
        if (jsonOutput) {
          output.errors.push({
            location: [start.line + 1, start.character + 1],
            message: msg,
            path: diag.file.fileName,
          });

        } else {
          stderr(`${result.path}#L${start.line + 1}C${start.character + 1}: ${msg}`);
        }
      }
    }

  }

  if (jsonOutput) {
    stdout(JSON.stringify(output));
  }

  return ecode;

}

export function test(
  configPath: string,
  jsonOutput: boolean,
  stdout: (s: string) => void,
  stderr: (s: string) => void) {

  const count = { success: 0, failure: 0, skipped: 0 };

  const messages = [];

  for (const result of config.load(configPath).test()) {
    const testId = `#${result.test.index + 1} in ${result.test.rule.id}`;

    if (result.success === true) {
      count.success += 1;

    } else if (result.success === false) {
      count.failure += 1;

      if (result.test.match) {
        const msg = `No match found in match test ${testId}`;
        if (jsonOutput) {
          messages.push(msg);
        } else {
          stdout(msg);
        }
      } else {
        const msg = `Match found in unmatch test ${testId}`;
        if (jsonOutput) {
          messages.push(msg);
        } else {
          stdout(msg);
        }
      }

    } else {
      count.skipped += 1;

      const kind = result.test.match ? 'match' : 'unmatch';
      const msg = `Skipped ${kind} test ${testId}`;
      if (jsonOutput) {
        messages.push(msg);
      } else {
        stdout(msg);
      }

    }
  }

  if (jsonOutput) {
    stdout(JSON.stringify({ messages, summary: count }));
  } else {
    stdout('Summary:');
    stdout(` - Success: ${count.success} test(s)`);
    stdout(` - Failure: ${count.failure} test(s)`);
    stdout(` - Skipped: ${count.skipped} test(s)`);
  }

  return (count.failure + count.skipped) ? 1 : 0;

}

function findTSFiles(srcPaths: string[]) {
  return srcPaths
    .filter(p => fs.existsSync(p))
    .map(p => p.replace(/\/$/, ''))
    .map((p) => {
      if (fs.statSync(p).isDirectory()) {
        return fg.sync([
          `${p}/**/*.ts`,
          `${p}/**/*.tsx`,
          '!**/node_modules/**',
        ]).map(e => e.toString());
      }
      return [p];
    })
    .reduce((acc, paths) => acc.concat(paths), []);
}
