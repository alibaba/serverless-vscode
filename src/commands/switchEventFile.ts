import * as vscode from 'vscode';
import { recordPageView } from '../utils/visitor';
import { serverlessCommands } from '../utils/constants';
import { setEventFilePath } from '../utils/localConfig';

export function switchEventFile(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.SWITCH_EVENT_FILE.id,
    async (
      templatePath: string,
      serviceName: string,
      functionName: string,
      codeUri: string,
      eventFilePath: string,
    ) => {
      recordPageView('/switchEventFile');
      await setEventFilePath(templatePath, serviceName, functionName, codeUri, eventFilePath)
        .catch(ex => vscode.window.showErrorMessage(ex.message));
    }
  ));
}
