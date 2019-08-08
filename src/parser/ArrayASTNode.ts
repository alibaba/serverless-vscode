import { ASTNode } from './ASTNode';
import { ItemASTNode } from './ItemASTNode';
import { JSONSchema } from '../language-service/jsonSchema';
import { ValidationResult, ISchemaCollector } from '../language-service/parser/jsonParser';

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

  validate(
    schema: JSONSchema,
    validationResult: ValidationResult,
    matchingSchemas: ISchemaCollector,
  ): void {
    if (!matchingSchemas.include(this)) {
      return;
    }
    super.validate(schema, validationResult, matchingSchemas);
    if (schema.items) {
      this.items.forEach(item => {
        const itemValidationResult = new ValidationResult();
        item.validate(
          schema.items as JSONSchema,
          itemValidationResult,
          matchingSchemas,
        );
        validationResult.mergePropertyMatch(itemValidationResult);
      });
    }
  }

}
