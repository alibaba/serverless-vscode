import * as vscode from 'vscode';
import { TriggerDescriptor } from '../descriptors/descriptor';
import { serverlessCommands } from '../utils/constants';
import { recordPageView } from '../utils/visitor';
import { PanelManager } from '../webview/PanelManager';
import { TriggerInfoPanelCreator } from '../webview/TriggerInfoPanelCreator';

let panelManager: PanelManager<TriggerDescriptor>;

export function showRemoteTriggerInfo(context: vscode.ExtensionContext) {
  const creator = new TriggerInfoPanelCreator(context.extensionPath);
  panelManager = new PanelManager<TriggerDescriptor>(creator);
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.SHOW_REMOTE_TRIGGER_INFO.id,
    async (serviceName: string,
      functionName: string,
      triggerName: string,
      triggerType: string,
    ) => {
      recordPageView('/showRemoteTriggerInfo');
      await process(serviceName, functionName, triggerName, triggerType).catch(vscode.window.showErrorMessage);
    })
  );
}

export function clearRemoteTriggerInfo(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.CLEAR_REMOTE_TRIGGER_INFO.id, () => {
    panelManager.clear();
  }));
}

async function process(serviceName: string, functionName: string, triggerName: string, triggerType: string) {
  const panelTitle = `${serviceName}/${functionName}/${triggerName}`;
  const panel = panelManager.getOrCreatePanel(panelTitle, {
    serviceName,
    functionName,
    triggerName,
    triggerType,
  });
  PanelManager.showPanel(panel);
}
