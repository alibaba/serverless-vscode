import * as vscode from 'vscode';
import { getConfigFilePath, getOrInitEventConfig } from '../utils/localConfig';
import { serverlessCommands } from '../utils/constants';
import { recordPageView } from '../utils/visitor';
import { ext } from '../extensionVariables';

export function localInvokeConfig(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.LOCAL_INVOKE_CONFIG.id, async (
    templatePath: string,
    serviceName: string,
    functionName: string,
    codeUri: string,
  ) => {
    recordPageView('/localInvokeConfig');
    await process(templatePath, serviceName, functionName, codeUri)
      .catch(ex => vscode.window.showErrorMessage(ex.message));
  }));
}

async function process(
  templatePath: string,
  serviceName: string,
  functionName: string,
  codeUri: string,
) {
  if (!ext.cwd) {
    throw new Error('Please open a workspace');
  }
  await getOrInitEventConfig(templatePath, serviceName, functionName, codeUri);
  const configFilePath = getConfigFilePath();
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(configFilePath));
  await vscode.window.showTextDocument(document);
}
