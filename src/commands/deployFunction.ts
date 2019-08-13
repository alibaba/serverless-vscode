import * as vscode from 'vscode';
import { serverlessCommands } from '../utils/constants';
import { recordPageView } from '../utils/visitor';
import { Resource } from '../models/resource';
import { FunService } from '../services/FunService';

export function deployFunction(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.DEPLOY_FUNCTION.id,
    async (node: Resource) => {
      recordPageView('/deployFunction');
      const serviceName = node.resourceProperties && node.resourceProperties.serviceName;
      const functionName = node.label;
      await process(serviceName as string, functionName);
    })
  );
}

async function process(serviceName: string, functionName: string) {
  const cwd = vscode.workspace.rootPath;
  if (!cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return;
  }

  const funService = new FunService(cwd);
  funService.deploy(serviceName, functionName);
  setTimeout(() => {
    vscode.commands.executeCommand(serverlessCommands.REFRESH_REMOTE_RESOURCE.id);
  }, 5000);
}
