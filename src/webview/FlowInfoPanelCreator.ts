/* eslint-disable max-len */
import * as vscode from 'vscode';
import { FlowDescriptor } from '../descriptors/descriptor';
import { AbstractFlowPanelCreator } from './AbstractFlowPanelCreator';
import { FunctionFlowService } from '../services/FunctionFlowService';
import { recordPageView } from '../utils/visitor';

export class FlowInfoPanelCreator extends AbstractFlowPanelCreator<FlowDescriptor> {
  viewType = 'flowInfo';
  functionflowService: FunctionFlowService = new FunctionFlowService();

  public constructor(extensionPath: string) {
    super(extensionPath);
  }

  public getPanelTitle(descriptor: FlowDescriptor): string {
    return `${descriptor.flowName}`;
  }

  protected receiveMessage(message: any, descriptor: FlowDescriptor, panel: vscode.WebviewPanel) {
    switch (message.command) {
      case 'describeInitialEntry': {
        this.describeInitialEntry(message, descriptor, panel);
        return;
      }
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
  public describeInitialEntry(message: any, descriptor: FlowDescriptor, panel: vscode.WebviewPanel) {
    panel.webview.postMessage({
      id: message.id,
      data: {
        entry: '/',
      },
    });
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
