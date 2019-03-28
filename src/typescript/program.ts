import * as ts from 'typescript';
import * as tsconfig from 'tsconfig';
import { SourceFile } from './sourceFile';

export class Program {

  private readonly program: ts.Program;

  private readonly sourceFileCache = new Map<string, SourceFile>();

  constructor(srcPaths: string[], tsconfigPath: string) {
    const json = tsconfig.loadSync(tsconfigPath).config.compilerOptions;
    const opts = ts.convertCompilerOptionsFromJson(json, process.cwd()).options;
    this.program = ts.createProgram(srcPaths, opts);
  }

  *getSourceFiles(filter: (path: string) => boolean = _ => true) {
    for (const f of this.program.getSourceFiles()) {
      if (filter(f.fileName)) {
        yield this.getCachedSourceFile(f.fileName);
      }
    }
  }

  private getCachedSourceFile(path: string) {
    if (!this.sourceFileCache.has(path)) {
      const srcFile = new SourceFile(path, this.program);
      this.sourceFileCache.set(path, srcFile);
    }
    return this.sourceFileCache.get(path)!;
  }
}
