import { ASTNode } from './ASTNode';
import { ItemASTNode } from './ItemASTNode';

export class ArrayASTNode extends ASTNode {
  private items: ItemASTNode[];

  constructor(
    parent: ASTNode | undefined,
    start: number,
    end: number,
  ) {
    super(parent, 'array', start, end);
    this.items = [];
  }

  getChildNodes(): ASTNode[] {
    return this.items;
  }

  getValue(): any {
    return this.items.map(item => item.getValue());
  }

  addItem(item: ASTNode): boolean {
    if (item) {
      this.items.push(item);
      return true;
    }
    return false;
  }

}
