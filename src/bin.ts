import * as commander from 'commander';
import * as cli from './cli';
import { configureCompilerOptions } from './compiler';

commander.name('tyscan')
  .version('0.1.3', '-V, --version')
  .description('Command line tool for scanning TypeScript sources');

commander.command('scan [path...]')
  .alias('s')
  .description('scan pattern(s)')
  .option('-c, --config <path>', 'path to configration file', 'tyscan.yml')
  .option('-t, --tsconfig <path>', 'path to tsconfig.json', 'tsconfig.json')
  .option('-j, --json', 'output json')
  .option('-v, --verbose', 'verbose output')
  .action((paths, opts) => {
    configureCompilerOptions(opts.tsconfig);
    run(() => cli.scan(
      paths.length ? paths : ['.'],
      opts.config,
      opts.json || false,
      opts.verbose || false,
      console.log,
      console.error,
    ),
  );
  });

commander.command('test')
  .alias('t')
  .description('test pattern(s)')
  .option('-c, --config <path>', 'path to configration file', 'tyscan.yml')
  .option('-t, --tsconfig <path>', 'path to tsconfig.json', 'tsconfig.json')
  .option('-j, --json', 'output json')
  .action((opts) => {
    configureCompilerOptions(opts.tsconfig);
    run(() => cli.test(
      opts.config,
      opts.json || false,
      console.log,
      console.error,
    ));
  });

if (process.argv.slice(2).length === 0) {
  commander.outputHelp();
  process.exit(1);
}

commander.parse(process.argv);

function run(f: () => number) {
  let ecode = 1;
  try {
    ecode = f();
  } catch (e) {
    console.error(`${e.stack}`);
  } finally {
    process.exit(ecode);
  }
}
