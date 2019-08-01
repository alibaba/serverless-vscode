import * as vscode from 'vscode';
import * as Yaml from 'yaml-ast-parser';
import { isSupportedDocument, fixNodeForCompletion } from '../utils/document';
import { buildAstRecursively, getNodeFromOffset } from '../parser/parser';
import { ASTNode } from '../parser/ASTNode';
import { StringASTNode } from '../parser/StringASTNode';
import { ObjectASTNode } from '../parser/ObjectASTNode';
import { schema } from '../schema/schema';
import { recordPageView } from '../utils/visitor';

export class ServerlessCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ):
    vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    if (!isSupportedDocument(document)) {
      return Promise.resolve([]);
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

function doCompletion(
  document: vscode.TextDocument,
  position: vscode.Position,
  docRoot: ASTNode,
): vscode.CompletionItem[] {
  const node = getNodeFromOffset(docRoot, document.offsetAt(position));
  if (!node || !(<StringASTNode>node).isKey) {
    return [];
  }
  const path = node.getPath();
  if (!path || !path.length) { // 只对 Resource 的儿子以及后代进行 auto completion
    return [];
  }
  let resourceType = '';
  let pNode: ASTNode | undefined = node.parent; // StringASTNode.parent -> PropertyASTNode
  if (!pNode) {
    return [];
  }
  const completionPath = [];
  let typeFound = false;
  while (pNode && pNode.parent && pNode.parent.parent) {
    pNode = pNode.parent && pNode.parent.parent; // PropertyASTNode -> ObjectASTNode -> PropertyASTNode
    while (pNode && pNode.type !== 'property') { // 有可能遇到 ArrayASTNode 的情况
      pNode = pNode.parent;
    }
    if (!pNode) {
      return [];
    }
    const oNode = pNode.getValue();
    if (oNode.type === 'object') {
      (<ObjectASTNode>oNode).properties.forEach(p => {
        if (p.key.getValue() === 'Type') {
          typeFound = true;
          resourceType = p.value ? p.value.getValue() : '';
        }
      });
    }
    if (typeFound) {
      typeFound = false;
      completionPath.push(resourceType);
    } else {
      completionPath.push(pNode.slot);
    }
  }

  let schemaPoint = schema;
  while(completionPath.length) {
    const completionPathDot = completionPath.pop() as string;
    schemaPoint = schemaPoint.properties && (<any>schemaPoint.properties)[completionPathDot];
    if (!schemaPoint) {
      return [];
    }
  }

  if (!schemaPoint.properties) {
    return [];
  }

  return Object.keys(schemaPoint.properties).map(item => {
    const completionItem = new vscode.CompletionItem(item);
    const itemInfo: any = (<any>schemaPoint.properties)[item];
    completionItem.label = itemInfo.label || item;
    if (itemInfo.insertText) {
      completionItem.insertText = new vscode.SnippetString(itemInfo.insertText);
      completionItem.kind = vscode.CompletionItemKind.Class;
    } else {
      completionItem.kind = vscode.CompletionItemKind.Field;
    }
    if (itemInfo.documentation) {
      completionItem.documentation = new vscode.MarkdownString(`[文档地址：${item}](${itemInfo.documentation})`)
    }
    return completionItem;
  })

}
