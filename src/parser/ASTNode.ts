export class ASTNode {
  start: number;
  end: number;
  type: string;
  parent: ASTNode | undefined;
  slot: string | undefined;

  constructor(
    parent: ASTNode | undefined,
    type: string,
    start: number,
    end: number
  ) {
    this.parent = parent;
    this.type = type;
    this.start = start;
    this.end = end;
  }

  getValue(): any {
    return;
  }

  getChildNodes(): ASTNode[] {
    return [];
  }

  getPath(): string[] {
    const path = this.parent ? this.parent.getPath() : [];
    if (this.slot) {
      path.push(this.slot);
    }
    return path;
  }
}
