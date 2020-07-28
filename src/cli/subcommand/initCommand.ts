import * as fs from 'fs';
import * as path from 'path';
import { Command } from './command';

export class InitCommand extends Command {
  private static samplePath = path.resolve(__dirname, '../../../sample/tyscan.yml');

  run() {
    fs.copyFileSync(InitCommand.samplePath, 'tyscan.yml', fs.constants.COPYFILE_EXCL);
    return 0;
  }
}
