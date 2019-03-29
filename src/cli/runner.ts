import { Command } from './subcommand/command';

export function runCommand(command: Command, args: string[], opts: any) {
  command.configure(args, opts);

  try {
    process.exit(command.run());
  } catch (error) {
    printError(error, opts);
    process.exit(1);
  }
}

function printError(error: Error, opts: any) {
  if (shouldOutputJson(opts)) {
    const json = convertErrorToJson(error);
    console.log(JSON.stringify(json));
  } else {
    console.error(`${error.stack}`);
  }
}

function shouldOutputJson(opts: any) {
  if (opts.json === undefined) {
    return false;
  }
  return opts.json as boolean;
}

function convertErrorToJson(error: Error) {
  const stacktrace = error.stack!
    .split('\n')
    .slice(1)
    .map(s => s.trim())
    .map(s => s.replace(/^at /, ''));

  return { errors: [{ stacktrace, message: error.message }] };
}
