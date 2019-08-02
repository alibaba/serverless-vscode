import { ASTNode } from './ASTNode';

export class BooleanASTNode extends ASTNode {
  private value: boolean | string

  constructor(
    parent: ASTNode | undefined,
    value: boolean | string,
    start: number,
    end: number
  ) {
    super(parent, 'boolean', start, end);
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}
