import * as fs from 'fs';
import * as path from 'path';
import { CONFIG_FILE_NAME } from '../../constants';
import { Command } from './command';

export class InitCommand extends Command {
  private static samplePath = path.resolve(__dirname, '../../../sample/', CONFIG_FILE_NAME);

  run() {
    fs.copyFileSync(InitCommand.samplePath, CONFIG_FILE_NAME, fs.constants.COPYFILE_EXCL);
    console.log(`Successfully created "${CONFIG_FILE_NAME}"`);
    return 0;
  }
}
