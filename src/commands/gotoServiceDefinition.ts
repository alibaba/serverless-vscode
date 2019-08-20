import * as vscode from 'vscode';
import { ext } from '../extensionVariables';
import { serverlessCommands } from '../utils/constants';
import { isPathExists } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { TemplateService } from '../services/TemplateService';
import { findBlockEndLine, createDecorationTypesByOpacity, decorateEditor } from '../utils/document';

const serviceDecorationTypes: vscode.TextEditorDecorationType[] = createDecorationTypesByOpacity(
  { r: 255, g: 255, b: 64 },
  0.3,
  0.01,
  0.03,
);

export function gotoServiceDefinition(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.GOTO_SERVICE_DEFINITION.id,
    async (serviceName: string, templatePath: string) => {
      recordPageView('/gotoServiceDefinition');
      await process(serviceName, templatePath);
    })
  );
}

async function process(serviceName: string, templatePath: string) {
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
  let lineNumber = 0;
  let serviceFound = false;
  for (const line of templateContentLines) {
    if (line.trim().indexOf(serviceName + ':') >= 0) {
      serviceFound = true;
      break;
    }
    lineNumber++;
  }
  lineNumber = serviceFound ? lineNumber : 0;
  const cursorPosition = new vscode.Position(lineNumber, 0);
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(templatePath));
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
