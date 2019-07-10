import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { isPathExists } from '../utils/file';
import { getHandlerFileByRuntime } from '../utils/runtime';
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
  let localRoot = path.join(cwd, functionInfo.Properties.CodeUri);
  try {
    const localRootStat = fs.statSync(localRoot);
    if (localRootStat.isDirectory()) {
      const handlerFile = getHandlerFileByRuntime(functionInfo.Properties.Runtime);
      if (!handlerFile) {
        vscode.window.showErrorMessage(`invalid runtime ${functionInfo.Properties.Runtime}`)
        return;
      }
      localRoot = path.join(localRoot, handlerFile);
      if (!isPathExists(localRoot)) {
        vscode.window.showErrorMessage(`${localRoot} did not found`);
        return;
      }
    }
  } catch (err) {
    vscode.window.showErrorMessage(err.message);
    return;
  }
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(localRoot));
  await vscode.window.showTextDocument(document);
}
