import * as vscode from 'vscode';
import * as path from 'path';
import { isPathExists } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { TemplateService } from '../services/TemplateService';

export function gotoFunctionTemplate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('fc.extension.localResource.function.gotoTemplate', async (serviceName: string, functionName: string) => {
    recordPageView('/gotoFunctionTemplate');
    await process(serviceName, functionName);
  }));
}

async function process(serviceName: string, functionName: string) {
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
  let functionFound = false;
  let lineNumber = 0;
  for (const line of templateContentLines) {
    if (!serviceFound) {
      if (line.includes(serviceName)) {
        serviceFound = true;
      }
    } else if (serviceFound && !functionFound && line.includes(functionName)) {
      functionFound = true;
      break;
    }
    lineNumber++;
  }
  lineNumber = functionFound ? lineNumber : 0;
  const cursorPosition = new vscode.Position(lineNumber, 0);
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(localRoot));
  await vscode.window.showTextDocument(document).then(editor => {
    editor.selections = [new vscode.Selection(cursorPosition, cursorPosition)];
    editor.revealRange(new vscode.Range(cursorPosition, new vscode.Position(lineNumber + 10, 0)));
  });
}