import { ASTNode } from './ASTNode';
import { PropertyASTNode } from './PropertyASTNode';

export class ObjectASTNode extends ASTNode {
  properties: PropertyASTNode[];

  constructor(
    parent: ASTNode | undefined,
    start: number,
    end: number,
  ) {
    super(parent, 'object', start, end);
    this.properties = [];
  }

  getChildNodes(): ASTNode[] {
    return this.properties;
  }

  getValue(): any {
    const result: any = {};
    this.properties.forEach(p => {
      const v = p.value && p.value.getValue();
      if (typeof v !== undefined) {
        result[p.key.getValue()] = v;
      }
    });
    return result;
  }

  addProperty(node: PropertyASTNode): boolean {
    if (node) {
      this.properties.push(node);
      return true;
    }
    return false;
  }
}
