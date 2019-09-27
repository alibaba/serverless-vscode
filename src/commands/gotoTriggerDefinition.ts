import * as vscode from 'vscode';
import { ext } from '../extensionVariables';
import { serverlessCommands } from '../utils/constants';
import { isPathExists } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { TemplateService } from '../services/TemplateService';
import { findBlockEndLine, createDecorationTypesByOpacity, decorateEditor } from '../utils/document';

const triggerDecorationTypes: vscode.TextEditorDecorationType[] = createDecorationTypesByOpacity(
  { r: 64, g: 255, b: 255 },
  0.3,
  0.01,
  0.03,
);

export function gotoTriggerDefinition(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.GOTO_TRIGGER_DEFINITION.id,
    async (serviceName: string, functionName: string, triggerName: string, templatePath: string) => {
      recordPageView('/gotoTriggerDefinition');
      await process(serviceName, functionName, triggerName, templatePath)
        .catch(err => vscode.window.showErrorMessage(err.message));
    }
  ));
}

async function process(serviceName: string, functionName: string, triggerName: string, templatePath: string) {
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
  let functionFound = false;
  let triggerFound = false;
  let lineNumber = 0;
  for (const line of templateContentLines) {
    if (!serviceFound) {
      if (line.trim().indexOf(serviceName + ':') >= 0) {
        serviceFound = true;
      }
    } else if (!functionFound) {
      if (line.trim().indexOf(functionName + ':') >= 0) {
        functionFound = true;
      }
    } else if (line.trim().indexOf(triggerName + ':') >= 0) {
      triggerFound = true;
      break;
    }
    lineNumber++;
  }
  lineNumber = triggerFound ? lineNumber : 0;
  const cursorPosition = new vscode.Position(lineNumber, 0);
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(templatePath));
  await vscode.window.showTextDocument(document, {
    preserveFocus: true,
    preview: true,
  }).then(editor => {
    editor.selections = [new vscode.Selection(cursorPosition, cursorPosition)];
    editor.revealRange(new vscode.Range(cursorPosition, new vscode.Position(lineNumber + 10, 0)));
    if (functionFound) {
      const endLine = findBlockEndLine(document, cursorPosition);
      const decorationRange = new vscode.Range(new vscode.Position(lineNumber, 0), new vscode.Position(endLine + 1, 0));
      decorateEditor(editor, decorationRange, triggerDecorationTypes);
    }
  });
}
