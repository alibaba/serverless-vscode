import * as vscode from 'vscode';
import * as path from 'path';
import { serverlessCommands } from '../utils/constants';
import { isPathExists } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { TemplateService } from '../services/TemplateService';
import { findBlockEndLine, createDecorationTypesByOpacity, decorateEditor } from '../utils/document';

const nasDecorationTypes: vscode.TextEditorDecorationType[] = createDecorationTypesByOpacity(
  { r: 64, g: 255, b: 255 },
  0.3,
  0.01,
  0.03,
);

export function gotoNasTemplate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.GOTO_NAS_TEMPLATE.id,
    async (serviceName: string, mountDir: string) => {
      recordPageView('/gotoNasTemplate');
      await process(serviceName, mountDir);
    })
  );
}

async function process(serviceName: string, mountDir: string) {
  let cwd = vscode.workspace.rootPath;
  if (!cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return;
  }

  const localRoot = path.join(cwd, 'template.yml');
  if (!isPathExists(localRoot)) {
    vscode.window.showErrorMessage(`${localRoot} did not found`);
    return;
  }
  const templateService = new TemplateService(cwd);
  const templateContent = await templateService.getTemplateContent();
  if (!templateContent) {
    vscode.window.showErrorMessage('template.yml is empty or not exist');
    return;
  }
  const templateContentLines = templateContent.split('\n');
  let serviceFound = false;
  let nasConfigFound = false;
  let nasFound = false;
  let lineNumber = 0;
  for (const line of templateContentLines) {
    if (!serviceFound) {
      if (line.trim().indexOf(serviceName + ':') >= 0) {
        serviceFound = true;
      }
    } else if (!nasConfigFound) {
      if (line.trim().indexOf('NasConfig:') >= 0) {
        nasConfigFound = true;
        if (mountDir === 'Auto') {
          nasFound = line.trim().indexOf('Auto') >= 0;
          break;
        }
      }
    } else if ((line.trim() + '#').indexOf(mountDir + '#') >= 0) {
      nasFound = true;
      break;
    }
    lineNumber++;
  }
  lineNumber = nasFound ? lineNumber : 0;
  const cursorPosition = new vscode.Position(lineNumber, 0);
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(localRoot));
  await vscode.window.showTextDocument(document).then(editor => {
    editor.selections = [new vscode.Selection(cursorPosition, cursorPosition)];
    editor.revealRange(new vscode.Range(cursorPosition, new vscode.Position(lineNumber + 10, 0)));
    if (nasFound) {
      const arrayStartLine = mountDir === 'Auto' ? 0 : findArrayStartLine(document, lineNumber);
      const endLine = mountDir === 'Auto' ? lineNumber
        : findBlockEndLine(document, new vscode.Position(arrayStartLine, 0));
      const decorationRange = new vscode.Range(
        new vscode.Position(arrayStartLine, 0), new vscode.Position(endLine + 1, 0)
      );
      decorateEditor(editor, decorationRange, nasDecorationTypes);
    }
  });
}

function findArrayStartLine(document: vscode.TextDocument, lineNumber: number): number {
  let textLine = document.lineAt(lineNumber).text;
  while(!textLine.trimLeft().startsWith('- ')) {
    textLine = document.lineAt(--lineNumber).text;
  }
  return lineNumber;
}
