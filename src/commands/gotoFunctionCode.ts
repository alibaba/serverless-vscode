import * as vscode from 'vscode';
import { serverlessCommands } from '../utils/constants';
import { isPathExists } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { Resource, ResourceType, FunctionResource } from '../models/resource';
import { TemplateService } from '../services/TemplateService';

export function gotoFunctionCode(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand(serverlessCommands.GOTO_FUNCTION_CODE.id, async (node: Resource) => {
    recordPageView('/gotoFunctionCode');
    if (node.resourceType !== ResourceType.Function) {
      return;
    }
    const funcRes = node as FunctionResource;
    await process(funcRes.serviceName, funcRes.functionName);
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
