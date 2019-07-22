import * as vscode from 'vscode';
import * as open from 'open';
import { serverlessCommands, FUN_INSTALL_URL } from '../utils/constants';
import { validateFunInstalled } from '../validate/validateFunInstalled';
import { recordPageView } from '../utils/visitor';
import { FunService } from '../services/FunService';

export function deploy(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.SERVICE_DEPLOY.id,
    async () => {
      recordPageView('/deployService');
      if (! await validateFunInstalled()) {
        vscode.window.showInformationMessage('You should install "@alicloud/fun" first', 'Goto', 'Cancel')
          .then(choice => {
            if (choice === 'Goto') {
              open(FUN_INSTALL_URL);
            }
          });
        return;
      }
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
