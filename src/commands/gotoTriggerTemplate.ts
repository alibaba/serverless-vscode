import * as vscode from 'vscode';
import * as path from 'path';
import { serverlessCommands } from '../utils/constants';
import { isPathExists } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { TemplateService } from '../services/TemplateService';
import { findBlockEndLine, createDecorationTypes, decorateEditor } from '../utils/document';

const triggerDecorationTypes: vscode.TextEditorDecorationType[] = createDecorationTypes(
  { r: 64, g: 255, b: 255 },
  0.3,
  0.01,
  0.03,
);

export function gotoTriggerTemplate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.GOTO_TRIGGER_TEMPLATE.id,
    async (serviceName: string, functionName: string, triggerName: string) => {
      recordPageView('/gotoTriggerTemplate');
      await process(serviceName, functionName, triggerName).catch(err => vscode.window.showErrorMessage(err.message));
    }
  ));
}

async function process(serviceName: string, functionName: string, triggerName: string) {
  let cwd = vscode.workspace.rootPath;
  if (!cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return;
  }
  // TODO: 支持自定义 template 位置
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
  let functionFound = false;
  let triggerFound = false;
  let lineNumber = 0;
  for (const line of templateContentLines) {
    if (!serviceFound) {
      if (serviceName + ':' === line.trim()) {
        serviceFound = true;
      }
    } else if (!functionFound) {
      if (functionName + ':' ===  line.trim()) {
        functionFound = true;
      }
    } else if (triggerName + ':' === line.trim()) {
      triggerFound = true;
      break;
    }
    lineNumber++;
  }
  lineNumber = triggerFound ? lineNumber : 0;
  const cursorPosition = new vscode.Position(lineNumber, 0);
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(localRoot));
  await vscode.window.showTextDocument(document).then(editor => {
    editor.selections = [new vscode.Selection(cursorPosition, cursorPosition)];
    editor.revealRange(new vscode.Range(cursorPosition, new vscode.Position(lineNumber + 10, 0)));
    if (functionFound) {
      const endLine = findBlockEndLine(document, cursorPosition);
      const decorationRange = new vscode.Range(new vscode.Position(lineNumber, 0), new vscode.Position(endLine + 1, 0));
      decorateEditor(editor, decorationRange, triggerDecorationTypes);
    }
  });
}
