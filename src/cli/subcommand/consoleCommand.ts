
import * as ts from 'typescript';
import * as os from 'os';
import * as promptSync from 'prompt-sync';
import * as promptSyncHistory from 'prompt-sync-history';
import * as patternParser from '../../pattern/parser';
import { Program } from '../../typescript/program';
import { Files } from '../../typescript/file/files';
import { Command } from './command';

export class ConsoleCommand extends Command {

  run() {
    return console_(this.getSourcePaths(), this.getTSConfigPath());
  }
}

export function console_(srcPaths: string[], tsconfigPath: string) {
  console.log('TyScan console');
  printConsoleHelp();

  const history = promptSyncHistory(`${os.homedir()}/.tyscan_history`);
  const prompt = promptSync({ history });

  let files = Files.load(srcPaths);
  let program = new Program(files, tsconfigPath);

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
      files = Files.load(srcPaths);
      program = new Program(files, tsconfigPath);
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

    let pattern;
    try {
      pattern = patternParser.parse([patternString]);
    } catch (e) {
      console.log(`${e.stack}`);
      continue;
    }

    for (const result of program.getSourceFiles(s => !s.includes('node_modules/'))) {
      if (result.isSuccessfullyParsed()) {
        const nodes = pattern.scan(result.sourceFile, result.typeChecker);
        for (const node of nodes) {
          const start = ts.getLineAndCharacterOfPosition(result.sourceFile, node.getStart());
          const loc = `${result.path}#L${start.line + 1}C${start.character + 1}`;
          const txt = `${loc}\t${node.getText()}`;
          console.log(txt);
        }
      } else {
        const diags = result.getSyntacticDiagnostics();
        for (const diag of diags) {
          const start = ts.getLineAndCharacterOfPosition(result.sourceFile, diag.start);
          const msg = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
          console.log(
            `\x1b[31m${result.path}#L${start.line + 1}C${start.character + 1}: ${msg}\x1b[0m`);
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
