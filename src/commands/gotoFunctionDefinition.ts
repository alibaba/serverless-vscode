import * as vscode from 'vscode';
import { ext } from '../extensionVariables';
import { serverlessCommands } from '../utils/constants';
import { isPathExists } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { TemplateService } from '../services/TemplateService';
import { findBlockEndLine, createDecorationTypesByOpacity, decorateEditor } from '../utils/document';

const functionDecorationTypes: vscode.TextEditorDecorationType[] = createDecorationTypesByOpacity(
  { r: 255, g: 64, b: 255 },
  0.3,
  0.01,
  0.03,
);

export function gotoFunctionDefinition(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.GOTO_FUNCTION_DEFINITION.id,
    async (serviceName: string, functionName: string, templatePath: string) => {
      recordPageView('/gotoFunctionDefinition');
      await process(serviceName, functionName, templatePath);
    })
  );
}

async function process(serviceName: string, functionName: string, templatePath: string) {
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
  let lineNumber = 0;
  for (const line of templateContentLines) {
    if (!serviceFound) {
      if (line.trim().indexOf(serviceName + ':') >= 0) {
        serviceFound = true;
      }
    } else if (line.trim().indexOf(functionName + ':') >= 0) {
      functionFound = true;
      break;
    }
    lineNumber++;
  }
  lineNumber = functionFound ? lineNumber : 0;
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
      decorateEditor(editor, decorationRange, functionDecorationTypes);
    }
  });
}
