/* eslint-disable max-len */
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { recordPageView } from '../utils/visitor';
import { AbstractFlowPanelCreator } from './AbstractFlowPanelCreator';

export class FlowDefinitionPanelCreator extends AbstractFlowPanelCreator<vscode.Uri> {
  viewType = 'flowDefinition';

  public constructor(extensionPath: string) {
    super(extensionPath);
  }

  public getPanelTitle(uri: vscode.Uri): string {
    return path.basename(uri.fsPath);
  }

  protected receiveMessage(message: any, uri: vscode.Uri, panel: vscode.WebviewPanel) {
    switch (message.command) {
      case 'describeInitialEntry': {
        this.describeInitialEntry(message, uri, panel);
        return;
      }
      case 'describeFlowDefinition': {
        this.describeFlowDefinition(message, uri, panel);
        return;
      }
    }
  }
  public describeInitialEntry(message: any, uri: vscode.Uri, panel: vscode.WebviewPanel) {
    panel.webview.postMessage({
      id: message.id,
      data: {
        entry: '/definition',
      },
    });
  }

  public describeFlowDefinition(message: any, uri: vscode.Uri, panel: vscode.WebviewPanel) {
    recordPageView('/showDefinitionGraph');
    const content = fs.readFileSync(uri.fsPath, 'utf8');
    panel.webview.postMessage({
      id: message.id,
      data: {
        Definition: content,
      }
    });
  }

}
