import * as vscode from 'vscode';
import * as Yaml from 'yaml-ast-parser';
import * as osLocale from 'os-locale';
import { isSupportedDocument } from '../utils/document';
import { recordPageView } from '../utils/visitor';
import { ASTNode } from '../parser/ASTNode';
import { buildAstRecursively, getNodeFromOffset } from '../parser/parser';
import { JSONSchemaService } from '../language-service/services/jsonSchemaService';
import { ValidationResult, SchemaCollector } from '../language-service/parser/jsonParser';
import { PropertyASTNode } from '../parser/PropertyASTNode';
import { JSONSchema } from '../language-service/jsonSchema';


export class TemplateHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.ProviderResult<vscode.Hover> {
    if (!isSupportedDocument(document)) {
      return;
    }
    recordPageView('/templateHover');
    return this.doHover(document, position);
  }

  private parse(text: string): ASTNode {
    return buildAstRecursively(undefined, Yaml.load(text));;
  }

  private async doHover(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.Hover | undefined> {
    const docRoot = this.parse(document.getText());
    const node = getNodeFromOffset(docRoot, document.offsetAt(position));
    if (!node) {
      return;
    }
    const jsonSchemaService = JSONSchemaService.getJSONSchemaService();
    const resolvedSchema = await jsonSchemaService.getSchemaForResource();
    // 此处之所以做非空校验是因为 getSchemaForResource 方法的返回值标记了有可能返回 void
    // 目前并不会有得不到 schema 的情况
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
  if (!schema.properties) {
    return;
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
  const localDoc = getLocalDoc(schema);
  const markdown = [
    '| Property | Type |',
    '| :--- | :--- |',
    properties,
    localDoc ? `[Go To Documentation](${localDoc})` : '',
  ].join('\n');
  return markdown;
}

function getLocalDoc(schema: JSONSchema): string {
  const language = osLocale.sync();
  if (schema.document) {
    return (language && schema.document[language]) || schema.document['default'];
  }
  return ''
}
