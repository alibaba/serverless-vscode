import * as vscode from 'vscode';
import * as path from 'path';
import { isPathExists } from '../utils/file';
import { recordPageView } from '../utils/visitor';
import { FunService } from '../services/FunService';

export function initProject(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand('fc.extension.project.init', async () => {
    recordPageView('/initProject');
    let cwd = vscode.workspace.rootPath;
    if (!cwd) {
      vscode.window.showErrorMessage('Please open a workspace');
      return;
    }

    const runtimes = ['nodejs8', 'nodejs6', 'python3', 'python2.7', 'php7.2']
    vscode.window.showQuickPick(runtimes, {
      ignoreFocusOut: true,
      placeHolder: 'Select a runtime for your function project',
      canPickMany: false,
    }).then(runtime => {
      if (!cwd) {
        cwd = '';
      }
      if (!runtime) {
        return;
      }
      if (!runtimes.includes(runtime)) {
        vscode.window.showErrorMessage(`${runtime} runtime is invalid`);
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
      funService.init(runtime);
    })
  }));
}
