import * as vscode from 'vscode';
import { ServiceDescriptor } from '../descriptors/descriptor';
import { serverlessCommands } from '../utils/constants';
import { recordPageView } from '../utils/visitor';
import { PanelManager } from '../webview/PanelManager';
import { ServiceInfoPanelCreator } from '../webview/ServiceInfoPanelCreator';

let panelManager: PanelManager<ServiceDescriptor>;

export function showRemoteServiceInfo(context: vscode.ExtensionContext) {
  const creator = new ServiceInfoPanelCreator(context.extensionPath);
  panelManager = new PanelManager<ServiceDescriptor>(creator);
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.SHOW_REMOTE_SERVICE_INFO.id,
    async (serviceName: string) => {
      recordPageView('/showRemoteServiceInfo');
      await process(context, serviceName).catch(vscode.window.showErrorMessage);
    })
  );
}

export function clearRemoteServiceInfo(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.CLEAR_REMOTE_SERVICE_INFO.id, () => {
    panelManager.clear();
  }));
}

async function process(context: vscode.ExtensionContext, serviceName: string) {
  const panelTitle = serviceName;
  const panel = panelManager.getOrCreatePanel(panelTitle, { serviceName });
  PanelManager.showPanel(panel);
}
