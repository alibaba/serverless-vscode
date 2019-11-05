import * as vscode from 'vscode';
import * as path from 'path';
import { ext } from '../extensionVariables';
import { FlowDescriptor } from '../descriptors/descriptor';
import { AbstractInfoPanelCreator } from './AbstractInfoPanelCreator';
import { FunctionFlowService } from '../services/FunctionFlowService';

export class FlowInfoPanelCreator extends AbstractInfoPanelCreator<FlowDescriptor> {
  viewType = 'flowInfo';
  functionflowService: FunctionFlowService = new FunctionFlowService();

  public constructor(extensionPath: string) {
    super(extensionPath);
  }

  public getPanelTitle(descriptor: FlowDescriptor): string {
    return `${descriptor.flowName}`;
  }

  protected getHtmlForWebview(): string {
    const manifest = require(
      path.join(ext.context.extensionPath, 'resources', 'web', 'flow', 'build', 'asset-manifest.json')
    );
    const mainScript = manifest.files['main.js'];
    const mainStyle = manifest.files['main.css'];
    const scriptPathOnDisk = vscode.Uri.file(
      path.join(ext.context.extensionPath, 'resources', 'web', 'flow', 'build', mainScript)
    );
    const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });
    const stylePathOnDisk = vscode.Uri.file(
      path.join(ext.context.extensionPath, 'resources', 'web', 'flow', 'build', mainStyle)
    );
    const styleUri = stylePathOnDisk.with({ scheme: 'vscode-resource' });
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <title>React App</title>
        <link rel="stylesheet" type="text/css" href="${styleUri}">
        <base href="${vscode.Uri.file(
    path.join(ext.context.extensionPath, 'resources', 'web', 'flow', 'build')).with({ scheme: 'vscode-resource' })}/">
      </head>

      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="root"></div>

        <script src="${scriptUri}"></script>
      </body>
      </html>`;
  }

  protected receiveMessage(message: any, descriptor: FlowDescriptor, panel: vscode.WebviewPanel) {
    switch (message.command) {
      case 'describeFlow': {
        this.functionflowService.describeFlow(descriptor.flowName).then(flow => {
          panel.webview.postMessage({
            id: message.id,
            data: flow,
          });
        });
        return;
      }
    }
  }

  protected async update(panel: vscode.WebviewPanel, descriptor: FlowDescriptor) {
  }
}
