import * as commander from 'commander';
import * as packageJson from '../packageJson';
import { CONFIG_FILE_NAME } from '../constants';
import { runCommand } from './runner';
import { InitCommand } from './subcommand/initCommand';
import { ScanCommand } from './subcommand/scanCommand';
import { TestCommand } from './subcommand/testCommand';
import { ConsoleCommand } from './subcommand/consoleCommand';

export function main(...args: string[]) {
  if (args.slice(2).length === 0) {
    commander.outputHelp();
  } else {
    commander.parse(args);
  }
}

commander
  .name(packageJson.name)
  .version(packageJson.version, '-V, --version')
  .description(packageJson.description);

commander
  .command('console [path...]')
  .alias('c')
  .option('-t, --tsconfig <path>', 'path to tsconfig.json')
  .description('start interactive console')
  .action((args, opts) => runCommand(new ConsoleCommand(), args, opts));

commander
  .command('init')
  .alias('i')
  .option('-j, --json', 'output json')
  .description(`create sample ${CONFIG_FILE_NAME}`)
  .action((opts) => runCommand(new InitCommand(), [], opts));

commander
  .command('scan [path...]')
  .alias('s')
  .description('scan pattern(s)')
  .option('-c, --config <path>', 'path to configration file')
  .option('-t, --tsconfig <path>', 'path to tsconfig.json')
  .option('-j, --json', 'output json')
  .action((args, opts) => runCommand(new ScanCommand(), args, opts));

commander
  .command('test')
  .alias('t')
  .description('test pattern(s)')
  .option('-c, --config <path>', 'path to configration file')
  .option('-t, --tsconfig <path>', 'path to tsconfig.json')
  .option('-j, --json', 'output json')
  .action((opts) => runCommand(new TestCommand(), [], opts));
