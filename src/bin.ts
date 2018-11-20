import * as commander from 'commander';
import * as pjson from 'pjson';
import * as cli from './cli';

commander.name(pjson.name)
  .version(pjson.version, '-v, --version')
  .description(pjson.description);

commander.command('scan [path...]')
  .description('scan pattern(s)')
  .option('-c, --config <path>', 'path to configration file', 'tyscan.yml')
  .option('-j, --json', 'output json')
  .action((paths, opts) => run(
    () => cli.scan(paths.length ? paths : ['./src'], opts.config, opts.json || false),
  ));

commander.command('test')
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
