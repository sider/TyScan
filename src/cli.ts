import * as fg from 'fast-glob';
import * as fs from 'fs';
import * as ts from 'typescript';
import * as os from 'os';
import * as promptSync from 'prompt-sync';
import * as promptSyncHistory from 'prompt-sync-history';
import * as config from './config';
import * as compiler from './compiler';
import * as patternParser from './pattern/parser';
import { COPYFILE_EXCL } from 'constants';

export function init() {
  fs.copyFileSync(`${__dirname}/../sample/tyscan.yml`, 'tyscan.yml', COPYFILE_EXCL);
  return 0;
}

export function console_(srcPaths: string[]) {
  console.log('TyScan console');
  printConsoleHelp();

  const paths = findTSFiles(srcPaths);
  const history = promptSyncHistory(`${os.homedir()}/.tyscan_history`);
  const prompt = promptSync({ history });
  let program = compiler.compileFiles(paths);

  while (true) {
    let command = prompt('> ');

    if (command === null) {
      break;
    }
    command = command.trim();

    if (command.length === 0) {
      continue;
    }

    if (command === 'exit') {
      break;
    }

    if (command === 'reload') {
      program = compiler.compileFiles(paths);
      continue;
    }

    if (!command.startsWith('find')) {
      console.log(`Unknown command: ${command}`);
      printConsoleHelp();
      continue;
    }

    if (!command.match(/^find\s/)) {
      console.log('No pattern provided');
      continue;
    }

    const patternString = command.substring(4).trim();
    const pattern = patternParser.parse([patternString]);

    for (const path of paths) {
      const result = compiler.createResult(program, path);
      if (result.isSuccessful()) {
        const nodes = pattern.scan(result.srcFile, result.program.getTypeChecker());
        for (const node of nodes) {
          const start = ts.getLineAndCharacterOfPosition(result.srcFile, node.getStart());
          const loc = `${path}#L${start.line + 1}C${start.character + 1}`;
          const txt = `${loc}\t${node.getText()}`;
          console.log(txt);
        }
      } else {
        const diags = result.program.getSyntacticDiagnostics(result.srcFile);
        for (const diag of diags) {
          const start = ts.getLineAndCharacterOfPosition(result.srcFile, diag.start);
          const msg = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
          console.log(`\x1b[31m${path}#L${start.line + 1}C${start.character + 1}: ${msg}\x1b[0m`);
        }
      }
    }

  }

  history.save();
  return 0;
}

function printConsoleHelp() {
  console.log();
  console.log('Available commands:');
  console.log('  - find <pattern>  Find <pattern>');
  console.log('  - reload          Reload TypeScript files');
  console.log('  - exit            Exit');
  console.log();
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
              rule: {
                id: rule.id,
                message: rule.message,
                justification: rule.justification === undefined ? null : rule.justification,
              },
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
