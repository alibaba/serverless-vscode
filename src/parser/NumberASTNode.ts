import { ASTNode } from './ASTNode';

export class NumberASTNode extends ASTNode {
  isInteger: boolean;
  value: number;

  constructor(
    parent: ASTNode | undefined,
    start: number,
    end: number,
  ) {
    super(parent, 'number', start, end);
    this.isInteger = true;
    this.value = Number.NaN;
  }

  getValue(): any {
    return this.value;
  }
}
