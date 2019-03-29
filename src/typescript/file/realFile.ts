import { File } from './file';

export class RealFile extends File {

  constructor(path: string) {
    super(path, false);
  }
}
