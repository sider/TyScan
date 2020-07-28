import * as fg from 'fast-glob';
import * as fs from 'fs';
import { File } from './file';
import { RealFile } from './realFile';

export class Files {
  static load(paths: string[]) {
    const normalizedPaths = paths.map((p) => p.replace(/\/$/, ''));
    const validPaths = normalizedPaths.filter((p) => fs.existsSync(p));

    const filePaths = validPaths
      .map((p) => {
        if (fs.statSync(p).isDirectory()) {
          return fg.sync([`${p}/**/*.{ts,tsx}`]).map((e) => e.toString());
        }
        return [p];
      })
      .reduce((acc, paths) => acc.concat(paths), []);

    return new Files(filePaths.map((p) => new RealFile(p)));
  }

  private list: readonly File[];

  constructor(list: File[]) {
    this.list = Object.freeze(list);
  }

  findByPath(path: string): File | undefined {
    return this.list.find((f) => f.path === path);
  }

  map<T>(func: (file: File) => T): T[] {
    return this.list.map(func);
  }

  isEmpty(): boolean {
    return this.list.length === 0;
  }
}
