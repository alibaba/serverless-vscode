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

export function gotoFlowDefinition(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.GOTO_FLOW_DEFINITION.id,
    async (flowName: string, templatePath: string) => {
      recordPageView('/gotoFlowDefinition');
      await process(flowName, templatePath);
    })
  );
}

async function process(flowName: string, templatePath: string) {
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
  let flowFound = false;
  for (const line of templateContentLines) {
    if (line.trim().indexOf(flowName + ':') >= 0) {
      flowFound = true;
      break;
    }
    lineNumber++;
  }
  lineNumber = flowFound ? lineNumber : 0;
  const cursorPosition = new vscode.Position(lineNumber, 0);
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(templatePath));
  await vscode.window.showTextDocument(document, {
    preserveFocus: true,
    preview: true,
  }).then(editor => {
    editor.selections = [new vscode.Selection(cursorPosition, cursorPosition)];
    editor.revealRange(new vscode.Range(cursorPosition, new vscode.Position(lineNumber + 10, 0)));
    if (flowFound) {
      const endLine = findBlockEndLine(document, cursorPosition);
      const decorationRange = new vscode.Range(new vscode.Position(lineNumber, 0), new vscode.Position(endLine + 1, 0));
      editor.setDecorations(serviceDecorationTypes[0], [decorationRange]);
      decorateEditor(editor, decorationRange, serviceDecorationTypes);
    }
  });
}
