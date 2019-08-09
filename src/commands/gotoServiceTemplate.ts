import * as vscode from 'vscode';
import * as path from 'path';
import { serverlessCommands } from '../utils/constants';
import { isPathExists } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { TemplateService } from '../services/TemplateService';
import { findBlockEndLine, createDecorationTypes, decorateEditor } from '../utils/document';

const serviceDecorationTypes: vscode.TextEditorDecorationType[] = createDecorationTypes(
  { r: 255, g: 255, b: 64 },
  0.3,
  0.01,
  0.03,
);

export function gotoServiceTemplate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.GOTO_SERVICE_TEMPLATE.id,
    async (serviceName: string) => {
      recordPageView('/gotoServiceTemplate');
      await process(serviceName);
    })
  );
}

async function process(serviceName: string) {
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
  let lineNumber = 0;
  let serviceFound = false;
  for (const line of templateContentLines) {
    if (line.includes(serviceName)) {
      serviceFound = true;
      break;
    }
    lineNumber++;
  }
  lineNumber = serviceFound ? lineNumber : 0;
  const cursorPosition = new vscode.Position(lineNumber, 0);
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(localRoot));
  await vscode.window.showTextDocument(document).then(editor => {
    editor.selections = [new vscode.Selection(cursorPosition, cursorPosition)];
    editor.revealRange(new vscode.Range(cursorPosition, new vscode.Position(lineNumber + 10, 0)));
    if (serviceFound) {
      const endLine = findBlockEndLine(document, cursorPosition);
      const decorationRange = new vscode.Range(new vscode.Position(lineNumber, 0), new vscode.Position(endLine + 1, 0));
      editor.setDecorations(serviceDecorationTypes[0], [decorationRange]);
      decorateEditor(editor, decorationRange, serviceDecorationTypes);
    }
  });
}
