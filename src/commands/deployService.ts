import * as vscode from 'vscode';
import { ext } from '../extensionVariables';
import { serverlessCommands } from '../utils/constants';
import { recordPageView } from '../utils/visitor';
import { Resource, ResourceType, ServiceResource } from '../models/resource';
import { FunService } from '../services/FunService';

export function deployService(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.DEPLOY_SERVICE.id,
    async (node: Resource) => {
      recordPageView('/deployService');
      if (node.resourceType !== ResourceType.Service) {
        return;
      }
      const servRes = node as ServiceResource;
      await process(servRes.serviceName, servRes.templatePath as string);
    })
  );
}

async function process(serviceName: string, templatePath: string) {
  if (!ext.cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return;
  }

  const funService = new FunService(templatePath);
  funService.deploy(serviceName);
  setTimeout(() => {
    vscode.commands.executeCommand(serverlessCommands.REFRESH_REMOTE_RESOURCE.id);
  }, 5000);
}
