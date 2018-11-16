import * as fg from 'fast-glob';
import * as fs from 'fs';
import * as loader from './loader';

export function scan(srcPaths: string[], configPath: string, jsonOutput: boolean) {

  const paths = srcPaths
    .filter(p => fs.existsSync(p))
    .map(p => fs.statSync(p).isDirectory ? fg.sync(`${p}/**/*.ts`).map(e => e.toString()) : [p])
    .reduce((acc, paths) => acc.concat(paths));

  const config = loader.load(configPath);

  console.log(jsonOutput);
  console.log(paths);
  console.log(config);

  return 0;

}

export function test(configPath: string) {

  const config = loader.load(configPath);

  console.log(config);

  return 0;

}
