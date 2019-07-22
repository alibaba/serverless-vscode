import * as vscode from 'vscode';
import { serverlessCommands } from '../utils/constants';
import { recordPageView } from '../utils/visitor';
import { FunctionDescriptor } from '../descriptors/descriptor';
import { PanelManager } from '../webview/PanelManager'
import { FunctionInfoPanelCreator } from '../webview/FunctionInfoPanelCreator';

let panelManager: PanelManager<FunctionDescriptor>;

export function showRemoteFunctionInfo(context: vscode.ExtensionContext) {
  const creator = new FunctionInfoPanelCreator(context.extensionPath);
  panelManager = new PanelManager<FunctionDescriptor>(creator);
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.SHOW_REMOTE_FUNCTION_INFO.id,
    async (serviceName: string, functionName: string) => {
      recordPageView('/showRemoteFunctionInfo');
      await process(context, serviceName, functionName).catch(vscode.window.showErrorMessage);
    })
  );
}

export function clearRemoteFunctionInfo(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.CLEAR_REMOTE_FUNCTION_INFO.id, () => {
    panelManager.clear();
  }));
}

async function process(context: vscode.ExtensionContext, serviceName: string, functionName: string) {
  const panelTitle = `${serviceName}/${functionName}`;
  const panel = panelManager.getOrCreatePanel(panelTitle, { serviceName, functionName });
  PanelManager.showPanel(panel);
}
