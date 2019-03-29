export abstract class Command {

  private args?: string[];

  private opts: any;

  abstract run(): number;

  configure(args: string[], opts: any) {
    this.args = args;
    this.opts = opts;
  }

  protected getSourcePaths() {
    if (this.args!.length === 0) {
      return ['.'];
    }
    return this.args!;
  }

  protected getTSConfigPath() {
    if (this.opts.tsconfig === undefined) {
      return 'tsconfig.json';
    }
    return this.opts.tsconfig;
  }

  protected getConfigPath() {
    if (this.opts.config === undefined) {
      return 'tyscan.yml';
    }
    return this.opts.config;
  }

  protected shouldOutputJson() {
    if (this.opts.json === undefined) {
      return false;
    }
    return this.opts.json;
  }
}
