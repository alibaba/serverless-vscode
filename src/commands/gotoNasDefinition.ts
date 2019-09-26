import * as vscode from 'vscode';
import { ext } from '../extensionVariables';
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

export function gotoNasDefinition(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.GOTO_NAS_DEFINITION.id,
    async (serviceName: string, mountDir: string, templatePath: string) => {
      recordPageView('/gotoNasDefinition');
      await process(serviceName, mountDir, templatePath);
    })
  );
}

async function process(serviceName: string, mountDir: string, templatePath: string) {
  if (!ext.cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return;
  }

  if (!isPathExists(templatePath)) {
    vscode.window.showErrorMessage(`${templatePath} did not found`);
    return;
  }
  const templateService = new TemplateService(templatePath);
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
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(templatePath));
  await vscode.window.showTextDocument(document, {
    preserveFocus: true,
    preview: true,
  }).then(editor => {
    editor.selections = [new vscode.Selection(cursorPosition, cursorPosition)];
    editor.revealRange(new vscode.Range(cursorPosition, new vscode.Position(lineNumber + 10, 0)));
    if (nasFound) {
      const arrayStartLine = mountDir === 'Auto' ? lineNumber : findArrayStartLine(document, lineNumber);
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
