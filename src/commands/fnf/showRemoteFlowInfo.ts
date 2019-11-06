import * as vscode from 'vscode';
import { serverlessCommands } from '../../utils/constants';
import { recordPageView } from '../../utils/visitor';
import { FlowDescriptor } from '../../descriptors/descriptor';
import { PanelManager } from '../../webview/PanelManager'
import { FlowInfoPanelCreator } from '../../webview/FlowInfoPanelCreator';

let panelManager: PanelManager<FlowDescriptor>;

export function showRemoteFlowInfo(context: vscode.ExtensionContext) {
  const creator = new FlowInfoPanelCreator(context.extensionPath);
  panelManager = new PanelManager<FlowDescriptor>(creator);
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.SHOW_REMOTE_FLOW_INFO.id,
    async (flowName: string) => {
      recordPageView('/showRemoteFlowInfo');
      await process(context, flowName).catch(vscode.window.showErrorMessage);
    })
  );
}

export function clearRemoteFlowInfo(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(serverlessCommands.CLEAR_REMOTE_FLOW_INFO.id, () => {
    panelManager.clear();
  }));
}

async function process(context: vscode.ExtensionContext, flowName: string) {
  const panelTitle = flowName;
  const panel = panelManager.getOrCreatePanel(panelTitle, { flowName });
  PanelManager.showPanel(panel);
}
