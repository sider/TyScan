import * as commander from 'commander';
import * as cli from './cli';
import { configureCompilerOptions } from './compiler';

commander.name('tyscan')
  .version('0.1.3', '-V, --version')
  .description('Command line tool for scanning TypeScript sources');

commander.command('init')
  .alias('i')
  .description('create sample tyscan.yml')
  .action((_) => {
    run(() => cli.init(), false);
  });

commander.command('console [path...]')
  .alias('c')
  .description('start interactive console')
  .action((paths, _) => {
    run(() => cli.console_(paths.length ? paths : ['.']), false);
  });

commander.command('scan [path...]')
  .alias('s')
  .description('scan pattern(s)')
  .option('-c, --config <path>', 'path to configration file', 'tyscan.yml')
  .option('-t, --tsconfig <path>', 'path to tsconfig.json', 'tsconfig.json')
  .option('-j, --json', 'output json')
  .option('-v, --verbose', 'verbose output')
  .action((paths, opts) => {
    configureCompilerOptions(opts.tsconfig);
    const srcPaths = paths.length ? paths : ['.'];
    const jsonOutput = opts.json || false;
    const verbose = opts.verbose || false;
    run(
      () => cli.scan(srcPaths, opts.config, jsonOutput, verbose, console.log, console.error),
      jsonOutput,
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
    const jsonOutput = opts.json || false;
    run(
      () => cli.test(opts.config, jsonOutput, console.log, console.error),
      jsonOutput,
    );
  });

if (process.argv.slice(2).length === 0) {
  commander.outputHelp();
  process.exit(1);
}

commander.parse(process.argv);

function run(f: () => number, jsonOutput: boolean) {
  let ecode = 1;
  try {
    ecode = f();
  } catch (e) {
    const err: Error = e;
    if (jsonOutput) {
      const stacktrace = <string[]>[];
      err.stack!.split('\n')
        .slice(1)
        .map((s, i, a) => s.trim())
        .map((s, i, a) => s.replace(/^at /, ''))
        .forEach((s, i, a) => stacktrace.push(s));

      const json = { errors: [{ stacktrace, message: err.message }] };
      console.log(JSON.stringify(json));
    } else {
      console.error(`${err.stack}`);
    }
  } finally {
    process.exit(ecode);
  }
}
