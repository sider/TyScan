import { File } from './file';

export class VirtualFile extends File {

  readonly content: string;

  constructor(path: string, content: string) {
    super(path, true);
    this.content = content;
  }
}
