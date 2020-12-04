import * as vscode from 'vscode';
import * as path from 'path';
import { serverlessCommands } from '../utils/constants';
import { isPathExists } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { FunService } from '../services/FunService';
import { getSupportedInitTemplates } from '../utils/runtime';

export function initProject(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.INIT_PROJECT.id, async () => {
    recordPageView('/initProject');
    let cwd = vscode.workspace.rootPath;
    if (!cwd) {
      vscode.window.showErrorMessage('Please open a workspace');
      return;
    }

    const templates = getSupportedInitTemplates();
    vscode.window.showQuickPick(templates, {
      ignoreFocusOut: true,
      placeHolder: 'Select a template for your function project',
      canPickMany: false,
    }).then(template => {
      if (!cwd) {
        cwd = '';
      }
      if (!template) {
        return;
      }

      const funService = new FunService(cwd);
      // check template.yml file
      const templateFilePath = path.join(cwd, 'template.yml');
      if (isPathExists(templateFilePath)) {
        vscode.window.showWarningMessage('This project has template.yml. '
          + 'Initializing the project in this case is not recommended. If you insist，please remove it first.');
        return;
      }
      funService.initTemplate(template);
    })
  }));
}
