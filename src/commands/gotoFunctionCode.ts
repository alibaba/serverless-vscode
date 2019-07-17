import * as vscode from 'vscode';
import { isPathExists } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { Resource } from '../models/resource';
import { TemplateService } from '../services/TemplateService';

export function gotoFunctionCode(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand('fc.extension.localResource.gotoFunction', async (node: Resource) => {
    recordPageView('/gotoFunctionCode');
    const serviceName = node.resourceProperties && node.resourceProperties.serviceName
      ? node.resourceProperties.serviceName : '';
    const functionName = node.label;
    await process(serviceName, functionName);
  });
}

export async function process(serviceName: string, functionName: string) {
  let cwd = vscode.workspace.rootPath;
  if (!cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return;
  }

  const templateService = new TemplateService(cwd);
  const functionInfo = await templateService.getFunction(serviceName, functionName);
  let localRoot = templateService.getHandlerFilePathFromFunctionInfo(cwd, functionInfo);
  if (!localRoot || !isPathExists(localRoot)) {
    vscode.window.showErrorMessage(`${localRoot} did not found`);
    return;
  }
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(localRoot));
  await vscode.window.showTextDocument(document);
}
