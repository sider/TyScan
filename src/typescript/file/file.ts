export abstract class File {

  readonly path: string;

  readonly isVirtual: boolean;

  constructor(path: string, isVirtual: boolean) {
    this.path = path;
    this.isVirtual = isVirtual;
  }
}
