import * as vscode from 'vscode';
import * as path from 'path';
import * as open from 'open';
import { ext } from '../extensionVariables';
import { isPathExists } from '../utils/file';
import { serverlessCommands } from '../utils/constants';
import { recordPageView } from '../utils/visitor';
import { Resource, ResourceType, NasResource } from '../models/resource';

export function openNasLocalDir(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.OPEN_NAS_LOCAL_DIR.id,
    async (node: Resource) => {
      recordPageView('/openNasLocalDir');
      if (node.resourceType !== ResourceType.Nas) {
        return;
      }
      const nasRes = node as NasResource;
      await process(nasRes.serverAddr, nasRes.templatePath as string)
        .catch(err => vscode.window.showErrorMessage(err.message));
    }
  ));
}

async function process(serverAddr: string, templatePath: string) {
  if (!ext.cwd) {
    vscode.window.showErrorMessage('Please open a workspace');
    return;
  }
  serverAddr = serverAddr.replace(':/', '/');
  const dirPath = path.resolve(path.dirname(templatePath), '.fun', 'nas', ...serverAddr.split('/'));
  if (!isPathExists(dirPath)) {
    vscode.window.showInformationMessage('You should execute fun nas init first');
    return;
  }
  await open(dirPath);
}
