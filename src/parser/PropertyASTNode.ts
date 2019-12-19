import { ASTNode } from './ASTNode';
import { StringASTNode } from './StringASTNode';
import { SlotASTNode } from './SlotASTNode';
import { JSONSchema } from '../language-service/jsonSchema';
import { ValidationResult, ISchemaCollector } from '../language-service/parser/jsonParser';
import { CustomTag } from '../language-service/model/customTags';

export class PropertyASTNode extends SlotASTNode {
  key: StringASTNode;
  value: ASTNode | undefined;
  colonOffset: number;

  constructor(
    parent: ASTNode | undefined,
    key: StringASTNode,
    start: number,
    end: number,
    customTag?: CustomTag,
  ) {
    super(parent, 'property', start, end, customTag);
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

  validate(
    schema: JSONSchema,
    validationResult: ValidationResult,
    matchingSchemas: ISchemaCollector,
  ): void {
    if (!matchingSchemas.include(this)) {
      return;
    }
    if (this.value) {
      this.value.validate(schema, validationResult, matchingSchemas);
    }
  }
}
