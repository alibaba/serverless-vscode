import * as vscode from 'vscode';
import { ServiceDescriptor } from '../descriptors/descriptor';
import { AbstractFlowPanelCreator } from './AbstractFlowPanelCreator';
import { FunctionComputeService } from '../services/FunctionComputeService';
import { serverlessCommands } from '../utils/constants';

export class ServiceInfoPanelCreator extends AbstractFlowPanelCreator<ServiceDescriptor> {
  viewType = 'serviceInfo';

  public constructor(extensionPath: string) {
    super(extensionPath);
  }

  public getPanelTitle(descriptor: ServiceDescriptor): string {
    return descriptor.serviceName;
  }

  protected receiveMessage(message: any, descriptor: ServiceDescriptor, panel: vscode.WebviewPanel) {
    switch (message.command) {
      case 'describeInitialEntry': {
        this.describeInitialEntry(message, descriptor, panel);
        return;
      }
      case 'fc/getService': {
        this.getService(message, descriptor, panel);
        return;
      }
      case 'fc/listFunctions': {
        this.listFunctions(message, descriptor, panel);
        return;
      }
      case 'fc/showRemoteFunctionInfo': {
        this.showRemoteFunctionInfo(message, descriptor, panel);
        return;
      }
    }
  }

  public describeInitialEntry(message: any, descriptor: ServiceDescriptor, panel: vscode.WebviewPanel) {
    panel.webview.postMessage({
      id: message.id,
      data: {
        entry: `/fc/services/item/${descriptor.serviceName}`,
      },
    });
  }

  public async getService(message: any, descriptor: ServiceDescriptor, panel: vscode.WebviewPanel) {
    const functionComputeService = new FunctionComputeService();
    const serviceInfo = await functionComputeService.getService(descriptor.serviceName);
    const serviceBaseInfo: any = {
      ...(serviceInfo || {}),
      regionId: functionComputeService.getRegion(),
    };
    panel.webview.postMessage({
      id: message.id,
      data: serviceBaseInfo,
    });
  }

  public async listFunctions(message: any, descriptor: ServiceDescriptor, panel: vscode.WebviewPanel) {
    const functionComputeService = new FunctionComputeService();
    const data = await functionComputeService.listFunctions(descriptor.serviceName, message.nextToken);
    panel.webview.postMessage({
      id: message.id,
      data,
    });
  }

  public async showRemoteFunctionInfo(message: any, descriptor: ServiceDescriptor, panel: vscode.WebviewPanel) {
    vscode.commands.executeCommand(
      serverlessCommands.SHOW_REMOTE_FUNCTION_INFO.id,
      descriptor.serviceName,
      message.functionName,
    );
  }
}
