import { EXIT_CODE_ERROR } from '../constants';
import { Command } from './subcommand/command';

export function runCommand(command: Command, args: string[], opts: any): void {
  command.configure(args, opts);

  try {
    process.exit(command.run());
  } catch (error) {
    if (error instanceof Error) {
      printError(error, opts);
    } else {
      console.error(String(error));
    }
    process.exit(EXIT_CODE_ERROR);
  }
}

function printError(error: Error, opts: any) {
  if (shouldOutputJson(opts)) {
    const json = convertErrorToJson(error);
    console.log(JSON.stringify(json));
  } else if (error.stack) {
    console.error(error.stack);
  } else {
    console.error(error.toString());
  }
}

function shouldOutputJson(opts: any): boolean {
  const json = opts.json;
  if (typeof json === 'boolean') {
    return json;
  } else {
    return false;
  }
}

function convertErrorToJson(error: Error): { errors: { stacktrace: string[]; message: string }[] } {
  const stack = error.stack;
  const stacktrace = stack
    ? stack
        .split('\n')
        .slice(1)
        .map((s) => s.trim())
        .map((s) => s.replace(/^at /, ''))
    : [];

  return { errors: [{ stacktrace, message: error.message }] };
}
