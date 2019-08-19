import * as vscode from 'vscode';
import { ext } from '../extensionVariables';
import { serverlessCommands } from '../utils/constants';
import { recordPageView } from '../utils/visitor';
import { FunService } from '../services/FunService';
import { TemplateResource } from '../models/resource';

export function deploy(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.DEPLOY.id,
    async (node?: TemplateResource) => {
      recordPageView('/deploy');
      await process(node ? node.templatePath : './template.yml');
    })
  );
}

async function process(templatePath: string) {
  if (!ext.cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return;
  }

  const funService = new FunService(templatePath);
  funService.deploy();
  setTimeout(() => {
    vscode.commands.executeCommand(serverlessCommands.REFRESH_REMOTE_RESOURCE.id);
  }, 5000);
}
