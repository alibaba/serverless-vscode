import * as vscode from 'vscode';
import { serverlessCommands } from '../utils/constants';
import { recordPageView } from '../utils/visitor';
import { Resource, ResourceType, NasResource } from '../models/resource';
import { FunService } from '../services/FunService';

export function syncNas(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.SYNC_NAS.id,
    async (node: Resource) => {
      recordPageView('/syncNas');
      if (node.resourceType !== ResourceType.Nas) {
        return;
      }
      const nasRes = node as NasResource;
      await process(nasRes.serviceName, nasRes.mountDir);
    }
  ));
}

async function process(serviceName: string, mountDir: string) {
  const cwd = vscode.workspace.rootPath;
  if (!cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return;
  }

  const funService = new FunService(cwd);
  funService.syncNas(serviceName, mountDir);
}
