import * as vscode from 'vscode';
import { recordPageView } from '../utils/visitor';
import { getSupportedRuntimes } from '../utils/runtime';

const RUNTIME_INSERT_TEXT =
  'RUNTIME ${1|'
  + getSupportedRuntimes().join(',')
  + '|}';

const runtimeCompletionItem = new vscode.CompletionItem('RUNTIME');
runtimeCompletionItem.kind = vscode.CompletionItemKind.Keyword;
runtimeCompletionItem.insertText = new vscode.SnippetString(RUNTIME_INSERT_TEXT);

const funInstallCompletionItem = new vscode.CompletionItem('fun-install');
funInstallCompletionItem.kind = vscode.CompletionItemKind.Method;

export class FunfileCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ):
    vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    if (!document.fileName.endsWith('Funfile')) {
      return Promise.resolve([]);
    }
    recordPageView('/funfileAutoCompletion');
    if (position.line === 0) {
      return [runtimeCompletionItem];
    }
    const textLine = document.lineAt(position.line);
    const str = textLine.text.substring(textLine.firstNonWhitespaceCharacterIndex, position.character);
    const matchResult = str.match(/\s+/g);
    if (matchResult) {
      if (matchResult.length === 1
        && textLine.text.substring(0, position.character).includes('RUN ')
      ) {
        return [funInstallCompletionItem];
      }
      return Promise.resolve([]);
    }
    return defaultItems.map(item => {
      const completionItem = new vscode.CompletionItem(item.label);
      completionItem.kind = vscode.CompletionItemKind.Keyword;
      if (item.insertText) {
        completionItem.insertText = new vscode.SnippetString(item.insertText);
      }
      return completionItem;
    });
  }
}

const defaultItems: {
  label: string,
  insertText?: string,
}[] = [
  {
    label: 'ARG',
    insertText: 'ARG ',
  },
  {
    label: 'COPY',
    insertText: 'COPY ${1:source} ${2:dest}',
  },
  {
    label: 'RUN',
    insertText: 'RUN ',
  },
  {
    label: 'WORKDIR',
    insertText: 'WORKDIR ',
  },
];
