// This file is to bridge the old code and the new code and should be removed when refactored.
import * as tsconfig from 'tsconfig';
import * as ts from 'typescript';
import { SourceFile } from './sourceFile';

export function configureCompilerOptions(path: string) {
  const json = tsconfig.loadSync(path).config.compilerOptions;
  compilerOptions = ts.convertCompilerOptionsFromJson(json, process.cwd()).options;
}

export function compileString(code: string) {
  const host = ts.createCompilerHost(compilerOptions);
  const getSourceFile = host.getSourceFile;
  host.getSourceFile = (fileName: string, langVersion: ts.ScriptTarget) => {
    if (fileName === TEST_FILE_NAME) {
      return ts.createSourceFile(fileName, code, langVersion);
    }
    return getSourceFile(fileName, langVersion);
  };

  const program = ts.createProgram([TEST_FILE_NAME], compilerOptions, host);
  return new SourceFile(TEST_FILE_NAME, program);
}

const TEST_FILE_NAME = '__tyscan_test__.tsx';

let compilerOptions = {};
