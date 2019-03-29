import * as ts from 'typescript';
import * as config from '../../config';
import { Files } from '../../typescript/file/files';
import { Command } from './command';

export class ScanCommand extends Command {
  run() {
    return scan(
      this.getSourcePaths(),
      this.getConfigPath(),
      this.shouldOutputJson(),
      console.log,
      console.error,
      this.getTSConfigPath(),
    );
  }
}

export function scan(
  srcPaths: string[],
  configPath: string,
  jsonOutput: boolean,
  stdout: (s: string) => void,
  stderr: (s: string) => void,
  tsconfigPath: string,
) {

  const files = Files.load(srcPaths);

  const output = { matches: <any[]>[], errors: <any[]>[] };

  const ecode = 0;

  for (const result of config.load(configPath, tsconfigPath).scan(files, tsconfigPath)) {
    const src = result.compileResult.sourceFile;

    if (result.nodes !== undefined) {
      for (const [rule, nodes] of result.nodes) {
        for (const node of nodes) {
          const start = ts.getLineAndCharacterOfPosition(src, node.getStart());

          if (jsonOutput) {
            const end = ts.getLineAndCharacterOfPosition(src, node.end);

            output.matches.push({
              rule: {
                id: rule.id,
                message: rule.message,
                justification: rule.justification === undefined ? null : rule.justification,
              },
              path: result.path,
              location: {
                start: [start.line + 1, start.character + 1],
                end: [end.line + 1, end.character + 1],
              },
            });

          } else {
            const loc = `${result.path}#L${start.line + 1}C${start.character + 1}`;
            const msg = `${rule.message} (${rule.id})`;
            const txt = `${loc}\t${node.getText()}\t${msg}`;
            stdout(`${txt}`);
          }
        }
      }
    } else {
      const diags = result.compileResult.getSyntacticDiagnostics();

      for (const diag of diags) {
        const start = ts.getLineAndCharacterOfPosition(src, diag.start);
        const msg = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
        if (jsonOutput) {
          output.errors.push({
            location: [start.line + 1, start.character + 1],
            message: msg,
            path: diag.file.fileName,
          });

        } else {
          stderr(`${result.path}#L${start.line + 1}C${start.character + 1}: ${msg}`);
        }
      }
    }

  }

  if (jsonOutput) {
    stdout(JSON.stringify(output));
  }

  return ecode;

}
