import * as vscode from 'vscode';
import * as Yaml from 'yaml-ast-parser';
import { isFlowDefinitionDocument, fixNodeForCompletion, isTemplateYaml } from '../utils/document';
import { buildAstRecursively, getNodeFromOffset } from '../parser/parser';
import { recordPageView } from '../utils/visitor';
import { ASTNode } from '../parser/ASTNode';
import { JSONSchemaService } from '../language-service/services/jsonSchemaService';
import { ValidationResult, SchemaCollector } from '../language-service/parser/jsonParser';
import { ObjectASTNode } from '../parser/ObjectASTNode';
import { JSONSchema } from '../language-service/jsonSchema';
import { StringASTNode } from '../parser/StringASTNode';

export class FlowDefinitionCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ):
    vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    if (!isFlowDefinitionDocument(document)) {
      return Promise.resolve([]);
    }
    recordPageView('/flowDefinitionAutoCompletion');
    const completionFix = fixNodeForCompletion(document, position);
    const newText = completionFix.newText;
    const root = parse(newText);
    const completionItems = doCompletion(document, position, root);
    return completionItems;
  }
}

function parse(text: string): ASTNode {
  const docItem = Yaml.load(text);
  const root = buildAstRecursively(undefined, docItem);
  return root;
}


async function doCompletion(
  document: vscode.TextDocument,
  position: vscode.Position,
  docRoot: ASTNode,
): Promise<vscode.CompletionItem[]> {
  const node = getNodeFromOffset(docRoot, document.offsetAt(position));
  if (!node || !(<StringASTNode>node).isKey) {
    return [];
  }
  const jsonSchemaService = JSONSchemaService.getJSONSchemaService();
  const resolvedSchema = await jsonSchemaService.getSchemaForFlow();
  if (!resolvedSchema) {
    return [];
  }
  const validationResult = new ValidationResult();
  const matchingSchemas = new SchemaCollector(undefined, undefined);
  docRoot.validate(resolvedSchema.schema, validationResult, matchingSchemas);
  let schema: JSONSchema | undefined;
  let curMinDist = Number.MAX_VALUE;
  matchingSchemas.schemas.forEach((applicableSchema) => {
    if (!applicableSchema.node || applicableSchema.node.type !== 'object') {
      return;
    }
    const objectNode = applicableSchema.node as ObjectASTNode;
    if (objectNode.contains(document.offsetAt(position))) {
      if (!schema) {
        schema = applicableSchema.schema;
        curMinDist = objectNode.end - objectNode.start;
      } else {
        const dist = objectNode.end - objectNode.start;
        if (dist < curMinDist) {
          curMinDist = dist;
          schema = applicableSchema.schema;
        }
      }
    }
  });
  if (!schema || !schema.properties) {
    return [];
  }

  const result: vscode.CompletionItem[] = [];

  Object.entries(schema.properties).forEach(([propertyName, propertySchema]) => {
    const completionItem = new vscode.CompletionItem(propertyName);
    completionItem.label = propertySchema.title || propertyName;
    completionItem.kind = vscode.CompletionItemKind.Field;
    result.push(completionItem);
  });

  return result;
}
