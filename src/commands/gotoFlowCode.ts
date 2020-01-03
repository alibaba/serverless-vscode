import * as vscode from 'vscode';
import * as path from 'path';
import { ext } from '../extensionVariables';
import { serverlessCommands } from '../utils/constants';
import { isPathExists } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { Resource, ResourceType, FlowResource } from '../models/resource';
import { TemplateService } from '../services/TemplateService';

export function gotoFlowCode(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand(serverlessCommands.GOTO_FLOW_CODE.id, async (node: Resource) => {
    recordPageView('/gotoFlowCode');
    if (node.resourceType !== ResourceType.Flow) {
      return;
    }
    const flowRes = node as FlowResource;
    await process(flowRes.flowName, flowRes.templatePath as string);
  });
}

export async function process(flowName: string, templatePath: string) {
  if (!ext.cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return;
  }

  const templateService = new TemplateService(templatePath);
  const flowInfo = await templateService.getFlow(flowName);
  const { Properties: { DefinitionUri = '' } = {} } = flowInfo;
  if (!DefinitionUri) {
    vscode.window.showErrorMessage(`${flowName} does not have DefinitionUri.`);
    return;
  }
  let localRoot = path.resolve(path.dirname(templatePath), DefinitionUri);
  if (!localRoot || !isPathExists(localRoot)) {
    vscode.window.showErrorMessage(`${localRoot} did not found`);
    return;
  }
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(localRoot));
  await vscode.window.showTextDocument(document, {
    preserveFocus: true,
    preview: true,
  });
}
