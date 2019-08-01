import { ASTNode } from './ASTNode';
import { StringASTNode } from './StringASTNode';
import { SlotASTNode } from './SlotASTNode';

export class PropertyASTNode extends SlotASTNode {
  key: StringASTNode;
  value: ASTNode | undefined;
  colonOffset: number;

  constructor(parent: ASTNode | undefined, key: StringASTNode, start: number, end: number) {
    super(parent, 'property', start, end);
    this.key = key;
    this.key.parent = this;
    this.slot = key.value;
    this.colonOffset = -1;
  }

  getChildNodes(): ASTNode[] {
    return this.value ? [this.key, this.value] : [this.key];
  }

  setValue(value: ASTNode): boolean {
    this.value = value;
    return value != null;
  }

  getValue(): any {
    return this.value;
  }
}
