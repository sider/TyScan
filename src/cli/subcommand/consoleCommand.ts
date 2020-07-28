import * as ts from 'typescript';
import * as os from 'os';
import * as promptSync from 'prompt-sync';
import * as promptSyncHistory from 'prompt-sync-history';
import * as patternParser from '../../pattern/parser';
import { EXIT_CODE_SUCCESS } from '../../constants';
import { Program } from '../../typescript/program';
import { Files } from '../../typescript/file/files';
import { Command } from './command';

export class ConsoleCommand extends Command {
  private readonly history: promptSync.History;

  private readonly prompt: promptSync.Prompt;

  private program?: Program;

  private input?: string;

  constructor() {
    super();
    this.history = promptSyncHistory(`${os.homedir()}/.tyscan_history`);
    this.prompt = promptSync({ history: this.history });
  }

  run() {
    ConsoleCommand.printHeader();
    ConsoleCommand.printHelp();

    while (this.readLine()) {
      const input = this.input!;
      if (input === '') {
        continue;
      }
      if (input === 'exit') {
        break;
      }
      if (input === 'reload') {
        this.reloadProgram();
        continue;
      }

      if (!input.startsWith('find')) {
        console.log(`Unknown command: ${input}`);
        ConsoleCommand.printHelp();
        continue;
      }
      if (!input.match(/^find\s/)) {
        console.log('No pattern provided');
        continue;
      }

      try {
        this.find(input.substring(4).trim());
      } catch (e) {
        console.log(`${e.stack}`);
      }
    }

    this.history.save();
    return EXIT_CODE_SUCCESS;
  }

  private find(patternString: string) {
    const pattern = patternParser.parse([patternString]);

    for (const result of this.getProgram().getNonNodeModuleSourceFiles()) {
      if (result.isSuccessfullyParsed()) {
        const nodes = pattern.scan(result);
        for (const node of nodes) {
          const start = result.getLineAndCharacter(node.getStart());
          const loc = `${result.path}#L${start.line + 1}C${start.character + 1}`;
          const txt = `${loc}\t${node.getText()}`;
          console.log(txt);
        }
      } else {
        const diags = result.getSyntacticDiagnostics();
        for (const diag of diags) {
          const start = result.getLineAndCharacter(diag.start);
          const line = start.line;
          const character = start.character;
          const path = result.path;
          const msg = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
          console.log(`\x1b[31m${path}#L${line + 1}C${character + 1}: ${msg}\x1b[0m`);
        }
      }
    }
  }

  private readLine() {
    this.input = this.prompt('> ');
    if (this.input === null) {
      return false;
    }
    this.input = this.input.trim();
    return true;
  }

  private getProgram() {
    if (this.program === undefined) {
      const files = Files.load(this.getSourcePaths());
      this.program = new Program(files, this.getTSConfigPath());
    }
    return this.program!;
  }

  private reloadProgram() {
    const files = Files.load(this.getSourcePaths());
    this.program = new Program(files, this.getTSConfigPath());
  }

  private static printHeader() {
    console.log('TyScan console');
  }

  private static printHelp() {
    console.log();
    console.log('Available commands:');
    console.log('  - find <pattern>  Find <pattern>');
    console.log('  - reload          Reload TypeScript files');
    console.log('  - exit            Exit');
    console.log();
  }
}
