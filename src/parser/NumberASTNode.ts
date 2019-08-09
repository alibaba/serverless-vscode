import { ASTNode } from './ASTNode';
import { JSONSchema } from '../language-service/jsonSchema';
import { ValidationResult, ISchemaCollector } from '../language-service/parser/jsonParser';

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

  validate(
    schema: JSONSchema,
    validationResult: ValidationResult,
    matchingSchemas: ISchemaCollector,
  ): void {
    if (!matchingSchemas.include(this)) {
      return;
    }

    let typeIsInteger = false;
    if (
      schema.type === 'integer' ||
      (
        Array.isArray(schema.type) &&
        (schema.type as string[]).indexOf('integer') >= 0
      )
    ) {
      typeIsInteger = true;
    }

    if (typeIsInteger && this.isInteger) {
      this.type = 'integer';
    }

    super.validate(schema, validationResult, matchingSchemas);
    this.type = 'number';

  }
}
