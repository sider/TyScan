#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import * as commander from 'commander';
import * as cli from './cli';

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json')).toString());

commander.name(pkg.name)
  .version(pkg.version, '-V, --version')
  .description(pkg.description);

commander.command('scan [path...]')
  .alias('s')
  .description('scan pattern(s)')
  .option('-c, --config <path>', 'path to configration file', 'tyscan.yml')
  .option('-j, --json', 'output json')
  .option('-v, --verbose', 'verbose output')
  .action((paths, opts) => run(
    () => cli.scan(
      paths.length ? paths : ['.'],
      opts.config,
      opts.json || false,
      opts.verbose || false,
    ),
  ));

commander.command('test')
  .alias('t')
  .description('test pattern(s)')
  .option('-c, --config <path>', 'path to configration file', 'tyscan.yml')
  .action(opts => run(
    () => cli.test(opts.config),
  ));

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
