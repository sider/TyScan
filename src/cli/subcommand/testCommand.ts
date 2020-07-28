import { Command } from './command';
import { EXIT_CODE_SUCCESS, EXIT_CODE_ERROR } from '../../constants';
import { load as loadConfig } from '../../config/loader';

export class TestCommand extends Command {
  readonly count = { success: 0, failure: 0, skipped: 0 };

  readonly messages: string[] = [];

  stdout = console.log;

  run() {
    for (const result of loadConfig(this.getConfigPath(), this.getTSConfigPath()).test()) {
      const testId = `#${result.test.index + 1} in ${result.test.rule.id}`;

      if (result.success === true) {
        this.count.success += 1;
      } else if (result.success === false) {
        this.count.failure += 1;

        if (result.test.match) {
          const msg = `No match found in match test ${testId}`;
          if (this.shouldOutputJson()) {
            this.messages.push(msg);
          } else {
            this.stdout(msg);
          }
        } else {
          const msg = `Match found in unmatch test ${testId}`;
          if (this.shouldOutputJson()) {
            this.messages.push(msg);
          } else {
            this.stdout(msg);
          }
        }
      } else {
        this.count.skipped += 1;

        const kind = result.test.match ? 'match' : 'unmatch';
        const msg = `Skipped ${kind} test ${testId}`;
        if (this.shouldOutputJson()) {
          this.messages.push(msg);
        } else {
          this.stdout(msg);
        }
      }
    }

    if (this.shouldOutputJson()) {
      this.stdout(JSON.stringify({ messages: this.messages, summary: this.count }));
    } else {
      this.stdout('Summary:');
      this.stdout(` - Success: ${this.count.success} test(s)`);
      this.stdout(` - Failure: ${this.count.failure} test(s)`);
      this.stdout(` - Skipped: ${this.count.skipped} test(s)`);
    }

    return this.count.failure + this.count.skipped ? EXIT_CODE_ERROR : EXIT_CODE_SUCCESS;
  }
}
