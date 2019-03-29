import { File } from './file';
import { RealFile } from './realFile';

export class Files extends Array<File> {

  get(path: string) {
    return this.find(f => f.path === path);
  }

  getPaths() {
    return this.map(f => f.path);
  }

  pushRealFiles(paths: string[]) {
    for (const path of paths) {
      this.push(new RealFile(path));
    }
  }
}
