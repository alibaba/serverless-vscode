import { JSONSchema } from '../language-service/jsonSchema';
import { ValidationResult, ISchemaCollector, ProblemSeverity } from '../language-service/parser/jsonParser';

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

  contains(offset: number, includeRightBound: boolean = false): boolean {
    return (
      (offset >= this.start && offset <= this.end) ||
      (includeRightBound && offset === this.end)
    )
  }

  validate(
    schema: JSONSchema,
    validationResult: ValidationResult,
    matchingSchemas: ISchemaCollector,
  ): void {
    // TODO： 目前 validation 中 matchingSchemas 恒包含要验证的节点
    // 这块是为了未来标记某些节点排除在校验外，可以通过这个表达式进行验证，目前是做个预留
    if (!matchingSchemas.include(this)) {
      return;
    }

    if (Array.isArray(schema.type)) {
      if ((schema.type as string[]).indexOf(this.type) === -1) {
        validationResult.problems.push({
          location: { start: this.start, end: this.end },
          severity: ProblemSeverity.Error,
          message:
            schema.errorMessage ||
            'Incorrect type. Expected one of ' +
            (schema.type as string[]).join(', ')
        });
      }
    } else if (schema.type) {
      if (this.type !== schema.type) {
        validationResult.problems.push({
          location: { start: this.start, end: this.end },
          severity: ProblemSeverity.Error,
          message:
            schema.errorMessage ||
            'Incorrect type. Expected ' +
            schema.type
        });
      }
    }

    let findMatch = false;

    const testAlternatives = (
      alternatives: JSONSchema[],
      maxOneMatch: boolean,
    ) => {
      const matches = [];
      let bestMatch: {
        schema: JSONSchema,
        validationResult: ValidationResult,
        matchingSchemas: ISchemaCollector,
      } | undefined;
      alternatives.forEach(subSchema => {
        const subValidationResult = new ValidationResult();
        const subMatchingSchemas = matchingSchemas.newSub();

        this.validate(
          subSchema,
          subValidationResult,
          subMatchingSchemas,
        );
        if (!subValidationResult.hasProblems()) {
          matches.push(subSchema);
        }
        if (!bestMatch) {
          bestMatch = {
            schema: subSchema,
            validationResult: subValidationResult,
            matchingSchemas: subMatchingSchemas,
          };
        } else {
          bestMatch = genericComparison(
            maxOneMatch,
            bestMatch,
            subSchema,
            subValidationResult,
            subMatchingSchemas,
          );
        }
      });
      if (matches.length > 1 && maxOneMatch) {
        validationResult.problems.push({
          location: { start: this.start, end: this.start },
          severity: ProblemSeverity.Error,
          message:
            'Matches multiple schemas when only one must validate.'
        });
      }
      if (bestMatch) {
        findMatch = true;
        validationResult.merge(bestMatch.validationResult);
        validationResult.propertiesMatches +=
          bestMatch.validationResult.propertiesMatches;
        validationResult.propertiesValueMatches +=
          bestMatch.validationResult.propertiesValueMatches;
        matchingSchemas.merge(bestMatch.matchingSchemas);
      }
      return matches.length;
    }
    if (Array.isArray(schema.anyOf)) {
      testAlternatives(schema.anyOf, false);
    }
    if (Array.isArray(schema.oneOf)) {
      testAlternatives(schema.oneOf, true);
    }

    if (Array.isArray(schema.enum)) {
      const val = this.getValue();
      let enumValueMatch = false;
      for (const e of schema.enum) {
        if (val === e) {
          enumValueMatch = true;
          break;
        }
      }
      validationResult.enumValues = schema.enum;
      validationResult.enumValueMatch = enumValueMatch;
      if (!enumValueMatch) {
        validationResult.problems.push({
          location: { start: this.start, end: this.end },
          severity: ProblemSeverity.Error,
          message:
            schema.errorMessage ||
            'Value is not accepted. Valid values: ' +
            schema.enum.map(v => JSON.stringify(v)).join(', '),
        });
      }
    }
    if (!findMatch) {
      matchingSchemas.add({ node: this, schema });
    }
  }
}

function genericComparison(
  maxOneMatch: boolean,
  bestMatch: {
    schema: JSONSchema,
    validationResult: ValidationResult,
    matchingSchemas: ISchemaCollector,
  },
  subSchema: JSONSchema,
  subValidationResult: ValidationResult,
  subMatchingSchemas: ISchemaCollector,
) {
  if (
    !maxOneMatch &&
    !subValidationResult.hasProblems() &&
    !bestMatch.validationResult.hasProblems()
  ) {
    bestMatch.matchingSchemas.merge(subMatchingSchemas);
    bestMatch.validationResult.propertiesMatches +=
      subValidationResult.propertiesMatches;
    bestMatch.validationResult.propertiesValueMatches +=
      subValidationResult.propertiesValueMatches;
  } else {
    const compareResult = subValidationResult.compareGeneric(
      bestMatch.validationResult
    );
    if (compareResult > 0) {
      bestMatch = {
        schema: subSchema,
        validationResult: subValidationResult,
        matchingSchemas: subMatchingSchemas,
      }
    } else if (compareResult === 0) {
      bestMatch.matchingSchemas.merge(subMatchingSchemas);
      bestMatch.validationResult.mergeEnumValues(subValidationResult);
    }
  }
  return bestMatch;
}
