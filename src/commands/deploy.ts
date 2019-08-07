import * as vscode from 'vscode';
import { serverlessCommands } from '../utils/constants';
import { recordPageView } from '../utils/visitor';
import { FunService } from '../services/FunService';

export function deploy(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.SERVICE_DEPLOY.id,
    async () => {
      recordPageView('/deployService');
      await process();
    })
  );
}

async function process() {
  const cwd = vscode.workspace.rootPath;
  if (!cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return;
  }

  const funService = new FunService(cwd);
  funService.deploy();
  setTimeout(() => {
    vscode.commands.executeCommand(serverlessCommands.REFRESH_REMOTE_RESOURCE.id);
  }, 5000);
}
