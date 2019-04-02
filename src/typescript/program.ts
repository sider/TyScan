import * as ts from 'typescript';
import * as tsconfig from 'tsconfig';
import { SourceFile } from './sourceFile';
import { Files } from './file/files';
import { VirtualFile } from './file/virtualFile';

export class Program {

  private readonly files: Files;

  private readonly tsconfigPath: string;

  private readonly sourceFileCache = new Map<string, SourceFile>();

  private program?: ts.Program;

  private compilerOptions?: ts.CompilerOptions;

  private compilerHost?: ts.CompilerHost;

  constructor(srcPaths: Files, tsconfigPath: string) {
    this.files = srcPaths;
    this.tsconfigPath = tsconfigPath;
  }

  *getSourceFiles(filter: (path: string) => boolean = _ => true) {
    for (const f of this.getProgram().getSourceFiles()) {
      if (filter(f.fileName)) {
        yield this.getCachedSourceFile(f.fileName);
      }
    }
  }

  private getCachedSourceFile(path: string) {
    if (!this.sourceFileCache.has(path)) {
      const srcFile = new SourceFile(path, this.getProgram());
      this.sourceFileCache.set(path, srcFile);
    }
    return this.sourceFileCache.get(path)!;
  }

  private getProgram() {
    if (this.program === undefined) {
      this.program = ts.createProgram(
        this.files.map(f => f.path),
        this.getCompilerOptions(),
        this.getCompilerHost(),
      );
    }
    return this.program!;
  }

  private getCompilerHost() {
    if (this.compilerHost === undefined) {
      this.compilerHost = ts.createCompilerHost(this.getCompilerOptions());
      const getSourceFile = this.compilerHost.getSourceFile;

      this.compilerHost.getSourceFile = (fileName: string, langVersion: ts.ScriptTarget) => {
        const file = this.files.findByPath(fileName);
        if (file !== undefined && file.isVirtual) {
          const virtualFile = file as VirtualFile;
          return ts.createSourceFile(virtualFile.path, virtualFile.content, langVersion);
        }
        return getSourceFile(fileName, langVersion);
      };
    }
    return this.compilerHost!;
  }

  private getCompilerOptions() {
    if (this.compilerOptions === undefined) {
      const json = tsconfig.loadSync(this.tsconfigPath).config.compilerOptions;
      this.compilerOptions = ts.convertCompilerOptionsFromJson(json, process.cwd()).options;
    }
    return this.compilerOptions!;
  }
}
