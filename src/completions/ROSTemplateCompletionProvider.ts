import * as vscode from 'vscode';
import * as Yaml from 'yaml-ast-parser';
import * as osLocale from 'os-locale';
import { isSupportedDocument, fixNodeForCompletion, isTemplateYaml } from '../utils/document';
import { buildAstRecursively, getNodeFromOffset } from '../parser/parser';
import { ASTNode } from '../parser/ASTNode';
import { JSONSchemaService } from '../language-service/services/jsonSchemaService';
import { ValidationResult, SchemaCollector } from '../language-service/parser/jsonParser';
import { StringASTNode } from '../parser/StringASTNode';
import { ObjectASTNode } from '../parser/ObjectASTNode';
import { JSONSchema } from '../language-service/jsonSchema';
import { recordPageView } from '../utils/visitor';
import { ROS_TEMPLATE_INSERT_TEXT, TRANSFORM_INSERT_TEXT } from '../schema/constants';
import { serverlessCommands } from '../utils/constants';

const triggerSuggestCmd = {
  command: serverlessCommands.TRIGGER_SUGGEST.id,
  title: serverlessCommands.TRIGGER_SUGGEST.title,
}

const rosTempCompletionItem = new vscode.CompletionItem('ROSTemplateFormatVersion');
rosTempCompletionItem.command = triggerSuggestCmd;
rosTempCompletionItem.insertText = ROS_TEMPLATE_INSERT_TEXT;

const transformCompletionItem = new vscode.CompletionItem('Transform');
transformCompletionItem.command = triggerSuggestCmd;
transformCompletionItem.insertText = TRANSFORM_INSERT_TEXT;

export class ROSTemplateCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ):
    vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    if (!isSupportedDocument(document)) {
      if (isTemplateYaml(document) && position.line === 0) {
        return [rosTempCompletionItem];
      }
      return Promise.resolve([]);
    }
    if (position.line === 1) {
      return [transformCompletionItem];
    }
    recordPageView('/templateAutoCompletion');
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
  const resolvedSchema = await jsonSchemaService.getSchemaForResource();
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
  if (!schema) {
    return [];
  }

  const result: vscode.CompletionItem[] = [];

  Object.entries(schema.properties || {}).forEach(([propertyName, propertySchema]) => {
    const completionItem = new vscode.CompletionItem(propertyName);
    completionItem.label = propertySchema.title || propertyName;
    if (propertySchema.insertText) {
      completionItem.insertText = new vscode.SnippetString(propertySchema.insertText);
      completionItem.kind = vscode.CompletionItemKind.Class;
    } else {
      completionItem.kind = vscode.CompletionItemKind.Field;
    }
    if (propertySchema.document) {
      completionItem.documentation =
        new vscode.MarkdownString(`[文档地址: ${propertyName}](${getLocalDoc(propertySchema)})`);
    }
    if (propertySchema.triggerSuggest) {
      completionItem.command = triggerSuggestCmd;
    }
    result.push(completionItem);
  });

  Object.entries(schema.patternProperties || {}).forEach(([patternExp, patternSchema]) => {
    if (!patternSchema.anyOf) {
      return;
    }
    patternSchema.anyOf.forEach((schema) => {
      if ((schema.$id || schema.title) && schema.insertText) {
        const label: string = (schema.$id || schema.title) as string;
        const completionItem = new vscode.CompletionItem(label);
        completionItem.insertText = new vscode.SnippetString(schema.insertText);
        completionItem.kind = vscode.CompletionItemKind.Class;
        if (schema.document) {
          completionItem.documentation =
        new vscode.MarkdownString(`[文档地址: ${label}](${getLocalDoc(schema)})`);
        }
        result.push(completionItem);
      }
    });
  });
  return result;
}

function getLocalDoc(schema: JSONSchema): string {
  const language = osLocale.sync();
  if (schema.document) {
    return (language && schema.document[language]) || schema.document['default'];
  }
  return ''
}
