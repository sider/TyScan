import { Command } from './command';
import * as config from '../../config';

export class TestCommand extends Command {
  run() {
    return test(
      this.getConfigPath(),
      this.shouldOutputJson(),
      console.log,
      console.error,
      this.getTSConfigPath(),
    );
  }
}

export function test(
  configPath: string,
  jsonOutput: boolean,
  stdout: (s: string) => void,
  stderr: (s: string) => void,
  tsconfigPath: string,
) {

  const count = { success: 0, failure: 0, skipped: 0 };

  const messages = [];

  for (const result of config.load(configPath, tsconfigPath).test()) {
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
