import * as vscode from 'vscode';
import { InvokeDescriptor } from '../descriptors/descriptor';
import { serverlessCommands } from '../utils/constants';
import { recordPageView } from '../utils/visitor';
import { PanelManager } from '../webview/PanelManager';
import { LocalInvokePanelCreator } from '../webview/LocalInvokePanelCreator';

let panelManager: PanelManager<InvokeDescriptor>;

export function showLocalInvokePanel(context: vscode.ExtensionContext) {
  const creator = new LocalInvokePanelCreator(context.extensionPath);
  panelManager = new PanelManager<InvokeDescriptor>(creator);
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.SHOW_LOCAL_INVOKE_PANEL.id,
    async (
      serviceName: string,
      functionName: string,
      templatePath: string,
      codeUri: string,
    ) => {
      recordPageView('/showLocalInvokePanel');
      await process(serviceName, functionName, templatePath, codeUri)
        .catch(vscode.window.showErrorMessage);
    })
  );
}

export function clearRemoteTriggerInfo(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.CLEAR_REMOTE_TRIGGER_INFO.id, () => {
    panelManager.clear();
  }));
}

async function process(
  serviceName: string,
  functionName: string,
  templatePath: string,
  codeUri: string,
) {
  const panelTitle = `${serviceName}/${functionName}`;
  const panel = panelManager.getOrCreatePanel(panelTitle, {
    serviceName,
    functionName,
    templatePath,
    codeUri,
  });
  PanelManager.showPanel(panel);
}
