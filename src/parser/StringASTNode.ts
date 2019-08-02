import { ASTNode } from './ASTNode';

export class StringASTNode extends ASTNode {
  isKey: boolean;
  value: string;

  constructor(
    parent: ASTNode | undefined,
    isKey: boolean,
    start: number,
    end: number,
  ) {
    super(parent, 'string', start, end);
    this.isKey = isKey;
    this.value = '';
  }

  getValue(): any {
    return this.value;
  }
}
