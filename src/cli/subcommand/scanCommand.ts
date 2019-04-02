import * as ts from 'typescript';
import { load as loadConfig } from '../../config/loader';
import { Files } from '../../typescript/file/files';
import { Command } from './command';

export class ScanCommand extends Command {

  stdout = console.log;

  stderr = console.error;

  run() {
    const files = Files.load(this.getSourcePaths());

    const output = { matches: <any[]>[], errors: <any[]>[] };

    const ecode = 0;

    const config = loadConfig(this.getConfigPath(), this.getTSConfigPath());
    for (const result of config.scan(files, this.getTSConfigPath())) {
      const src = result.compileResult;

      if (result.nodes !== undefined) {
        for (const [rule, nodes] of result.nodes) {
          for (const node of nodes) {
            const start = src.getLineAndCharacter(node.getStart());

            if (this.shouldOutputJson()) {
              const end = src.getLineAndCharacter(node.end);

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
              this.stdout(`${txt}`);
            }
          }
        }
      } else {
        const diags = result.compileResult.getSyntacticDiagnostics();

        for (const diag of diags) {
          const start = src.getLineAndCharacter(diag.start);
          const msg = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
          if (this.shouldOutputJson()) {
            output.errors.push({
              location: [start.line + 1, start.character + 1],
              message: msg,
              path: diag.file.fileName,
            });

          } else {
            this.stderr(`${result.path}#L${start.line + 1}C${start.character + 1}: ${msg}`);
          }
        }
      }

    }

    if (this.shouldOutputJson()) {
      this.stdout(JSON.stringify(output));
    }

    return ecode;
  }
}
