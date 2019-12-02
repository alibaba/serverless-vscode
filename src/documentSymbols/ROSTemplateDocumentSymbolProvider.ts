import * as vscode from 'vscode';
import * as Yaml from 'yaml-ast-parser';
import { isSupportedDocument } from '../utils/document';
import { buildAstRecursively } from '../parser/parser';
import { recordPageView } from '../utils/visitor';
import { ASTNode } from '../parser/ASTNode';
import { ArrayASTNode } from '../parser/ArrayASTNode';
import { ObjectASTNode } from '../parser/ObjectASTNode';
import { PropertyASTNode } from '../parser/PropertyASTNode';

export class ROSTemplateDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols(
    document: vscode.TextDocument
  ): vscode.ProviderResult<vscode.SymbolInformation[]> {
    if (!isSupportedDocument(document)) {
      return [];
    }
    recordPageView('/templateDocumentSymbol');

    const collectOutlineEntries = (
      node: ASTNode,
      containerName: string,
    ): vscode.SymbolInformation[] => {
      const result: vscode.SymbolInformation[] = [];
      if (node.type === 'array') {
        (node as ArrayASTNode).getChildNodes().forEach((itemNode: ASTNode) => {
          result.push(...collectOutlineEntries(itemNode, containerName));
        });
      }
      if (node.type === 'object') {
        (node as ObjectASTNode).properties.forEach((propertyNode: PropertyASTNode) => {
          if (propertyNode.value) {
            const location = new vscode.Location(
              document.uri,
              new vscode.Range(
                document.positionAt(propertyNode.start),
                document.positionAt(propertyNode.end),
              ),
            );
            result.push({
              name: propertyNode.key.value,
              kind: getSymbolKind(propertyNode.value.type),
              location,
              containerName,
            });

            const childContainerName = containerName ?
              `${containerName}.${propertyNode.key.value}`
              :
              propertyNode.key.value;
            result.push(...collectOutlineEntries(propertyNode.value, childContainerName));
          }
        });
      }
      return result;
    }

    const docRoot = buildAstRecursively(undefined, Yaml.load(document.getText()));
    const result = collectOutlineEntries(docRoot, '');
    return result;
  }
}

const getSymbolKind = (nodeType: string): vscode.SymbolKind => {
  switch(nodeType) {
    case 'object':
      return vscode.SymbolKind.Module;
    case 'string':
      return vscode.SymbolKind.String;
    case 'number':
      return vscode.SymbolKind.Number;
    case 'array':
      return vscode.SymbolKind.Array;
    case 'boolean':
      return vscode.SymbolKind.Boolean;
    default:
      return vscode.SymbolKind.Variable;
  }
}
