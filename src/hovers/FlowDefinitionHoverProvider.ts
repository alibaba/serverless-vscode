import * as vscode from 'vscode';
import * as Yaml from 'yaml-ast-parser';
import { isFlowDefinitionDocument } from '../utils/document';
import { recordPageView } from '../utils/visitor';
import { buildAstRecursively, getNodeFromOffset } from '../parser/parser';
import { JSONSchemaService } from '../language-service/services/jsonSchemaService';
import { ValidationResult, SchemaCollector } from '../language-service/parser/jsonParser';
import { PropertyASTNode } from '../parser/PropertyASTNode';
import { JSONSchema } from '../language-service/jsonSchema';
import { StringASTNode } from '../parser/StringASTNode';

export class FlowDefinitionHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.ProviderResult<vscode.Hover> {
    if (!isFlowDefinitionDocument(document)) {
      return;
    }
    recordPageView('/flowDefinitionHover');
    return this.doHover(document, position);
  }

  private async doHover(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.Hover | undefined> {
    const docRoot = buildAstRecursively(undefined, Yaml.load(document.getText()));
    const node = getNodeFromOffset(docRoot, document.offsetAt(position));
    if (!node || node.type !== 'string'
      || !(node as StringASTNode).isKey
    ) {
      return;
    }
    const jsonSchemaService = JSONSchemaService.getJSONSchemaService();
    const resolvedSchema = await jsonSchemaService.getSchemaForFlow();
    if (!resolvedSchema) {
      return;
    }
    const validationResult = new ValidationResult();
    const matchingSchemas = new SchemaCollector(undefined, undefined);
    let schema: JSONSchema | undefined;
    docRoot.validate(resolvedSchema.schema, validationResult, matchingSchemas);
    matchingSchemas.schemas.forEach(applicableSchema => {
      const parentNode = applicableSchema.node.parent;
      if (!parentNode || parentNode.type !== 'property') {
        return;
      }
      const propertyNode = parentNode as PropertyASTNode;
      if (!propertyNode.key.contains(document.offsetAt(position))) {
        return;
      }
      if (propertyNode.key.value === node.getValue()) {
        schema = applicableSchema.schema;
      }
    });
    if (!schema) {
      return;
    }
    const hoverRange = new vscode.Range(
      document.positionAt(node.start),
      document.positionAt(node.end),
    );
    const markdown = getSchemaDoc(schema);
    if (markdown) {
      return new vscode.Hover(
        [markdown],
        hoverRange,
      );
    }
  }
}

function getSchemaDoc(schema: JSONSchema): string | undefined {
  const markdown = [];
  let hasItems = false;
  if (!schema.properties) {
    schema = schema.items;
    if (!schema || !schema.properties) {
      return;
    }
    hasItems = true;
  }
  let properties = '';
  Object.entries(schema.properties).forEach(([propertyName, propertySchema]) => {
    let types: string[] = [];
    if (!propertySchema.type) {
      if (propertySchema.oneOf) {
        propertySchema.oneOf.forEach(singleSchema => {
          if (singleSchema.type) {
            types.push(singleSchema.type as string);
          }
        })
      }
    } else {
      types.push(propertySchema.type as string);
    }
    properties += `| \`${propertyName}\` | ${types.join()} |\n`;
  });
  markdown.push(
    `| ${hasItems ? 'Items ' : ''}Property | Type |`,
    '| :--- | :--- |',
    properties,
  );
  return markdown.join('\n');
}
