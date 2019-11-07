/* eslint-disable max-len */
import * as vscode from 'vscode';
import * as path from 'path';
import { ext } from '../extensionVariables';
import { FlowDescriptor } from '../descriptors/descriptor';
import { AbstractInfoPanelCreator } from './AbstractInfoPanelCreator';
import { FunctionFlowService } from '../services/FunctionFlowService';
import { recordPageView } from '../utils/visitor';

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
        recordPageView('/showRemoteFlowInfo/describeFlow');
        this.describeFlow(message, descriptor, panel);
        return;
      }
      case 'listExecutions': {
        recordPageView('/showRemoteFlowInfo/listExecutions');
        this.listExecutions(message, descriptor, panel);
        return;
      }
      case 'startExecution': {
        recordPageView('/showRemoteFlowInfo/startExecution');
        this.startExecution(message, descriptor, panel);
        return;
      }
      case 'describeExecution': {
        recordPageView('/showRemoteFlowInfo/describeExecution');
        this.describeExecution(message, descriptor, panel);
        return;
      }
      case 'getExecutionHistory': {
        recordPageView('/showRemoteFlowInfo/getExecutionHistory');
        this.getExecutionHistory(message, descriptor, panel);
        return;
      }
    }
  }

  public async describeFlow(message: any, descriptor: FlowDescriptor, panel: vscode.WebviewPanel) {
    const flow = await this.functionflowService.describeFlow(descriptor.flowName);
    panel.webview.postMessage({
      id: message.id,
      data: flow,
    });
  }

  public async listExecutions(message: any, descriptor: FlowDescriptor, panel: vscode.WebviewPanel) {
    const executions = await this.functionflowService.listExecutions(descriptor.flowName, message.nextToken);
    panel.webview.postMessage({
      id: message.id,
      data: executions,
    });
  }

  public async startExecution(message: any, descriptor: FlowDescriptor, panel: vscode.WebviewPanel) {
    try {
      const result = await this.functionflowService.startExecution(
        descriptor.flowName, message.input, message.executionName
      );
      panel.webview.postMessage({
        id: message.id,
        data: result,
      });
    } catch(ex) {
      panel.webview.postMessage({
        id: message.id,
        data: {
          code: ex.code,
          message: ex.message,
        },
      });
    }
  }

  public async describeExecution(message: any, descriptor: FlowDescriptor, panel: vscode.WebviewPanel) {
    const executionInfo = await this.functionflowService.describeExecution(descriptor.flowName, message.executionName);
    panel.webview.postMessage({
      id: message.id,
      data: executionInfo,
    });
  }

  public async getExecutionHistory(message: any, descriptor: FlowDescriptor, panel: vscode.WebviewPanel) {
    const executionHistory = await this.functionflowService.getExecutionHistory(
      descriptor.flowName,
      message.executionName,
      message.nextToken,
    );
    panel.webview.postMessage({
      id: message.id,
      data: executionHistory,
    });
  }

  protected async update(panel: vscode.WebviewPanel, descriptor: FlowDescriptor) {
  }
}
