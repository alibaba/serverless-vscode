import * as vscode from 'vscode';
import * as path from 'path';
import { recordPageView } from '../../utils/visitor';
import { serverlessCommands } from '../../utils/constants';
import { PanelManager } from '../../webview/PanelManager'
import { FlowDefinitionPanelCreator } from '../../webview/FlowDefinitionPanelCreator';

let panelManager: PanelManager<vscode.Uri>;

export function showDefinitionGraph(context: vscode.ExtensionContext) {
  const creator = new FlowDefinitionPanelCreator(context.extensionPath);
  panelManager = new PanelManager<vscode.Uri>(creator, vscode.ViewColumn.Beside);
  context.subscriptions.push(vscode.commands.registerCommand(
    serverlessCommands.FNF_SHOW_DEFINITION_GRAPH.id,
    async (uri: vscode.Uri) => {
      recordPageView('/showDefinitionGraph');
      await processCommand(uri).catch(ex => vscode.window.showErrorMessage(ex.message));
    }
  ));
}

async function processCommand(uri: vscode.Uri) {
  const panelTitle = path.basename(uri.fsPath);
  const panel = panelManager.getOrCreatePanel(panelTitle, uri);
  panelManager.showPanel(panel);
}
