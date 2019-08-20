import * as vscode from 'vscode';
import { ext } from '../extensionVariables';
import { serverlessCommands } from '../utils/constants';
import { recordPageView } from '../utils/visitor';
import { Resource, FunctionResource, ResourceType } from '../models/resource';
import { FunService } from '../services/FunService';

export function deployFunction(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.DEPLOY_FUNCTION.id,
    async (node: Resource) => {
      recordPageView('/deployFunction');
      if (node.resourceType !== ResourceType.Function) {
        return;
      }
      const funcRes = node as FunctionResource;
      await process(funcRes.serviceName, funcRes.functionName, funcRes.templatePath as string);
    })
  );
}

async function process(serviceName: string, functionName: string, templatePath: string) {
  if (!ext.cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return;
  }

  const funService = new FunService(templatePath);
  funService.deploy(serviceName, functionName);
  setTimeout(() => {
    vscode.commands.executeCommand(serverlessCommands.REFRESH_REMOTE_RESOURCE.id);
  }, 5000);
}
