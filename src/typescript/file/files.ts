import * as fg from 'fast-glob';
import * as fs from 'fs';
import { File } from './file';
import { RealFile } from './realFile';

export class Files extends Array<File> {

  static load(paths: string[]) {
    const normalizedPaths = paths.map(p => p.replace(/\/$/, ''));
    const validPaths = normalizedPaths.filter(p => fs.existsSync(p));

    const filePaths = validPaths.map((p) => {
      if (fs.statSync(p).isDirectory()) {
        return fg.sync([`${p}/**/*.{ts,tsx}`]).map(e => e.toString());
      }
      return [p];
    }).reduce((acc, paths) => acc.concat(paths), []);

    const files = filePaths.map(p => new RealFile(p));
    return new Files(...files);
  }

  findByPath(path: string) {
    return this.find(f => f.path === path);
  }
}
