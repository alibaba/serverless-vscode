import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import { serverlessCommands } from '../utils/constants';
import { isPathExists } from '../utils/file';
import {
  Resource,
  CommandResource,
  ServiceResource,
  FunctionResource,
  ResourceType,
  TriggerResource
} from '../models/resource';
import { FunctionComputeService } from '../services/FunctionComputeService';

export class RemoteResourceProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  _onDidChangeTreeData: vscode.EventEmitter<Resource | undefined> = new vscode.EventEmitter<Resource | undefined>();
  onDidChangeTreeData: vscode.Event<Resource | undefined> = this._onDidChangeTreeData.event;
  functionComputeService: FunctionComputeService = new FunctionComputeService();

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Resource): Thenable<Resource[]> {
    const accountInfoConfigPath = path.join(os.homedir(), '.fcli', 'config.yaml');
    if (!isPathExists(accountInfoConfigPath)) {
      return Promise.resolve([
        new CommandResource(serverlessCommands.BIND_ACCOUNT.title, serverlessCommands.BIND_ACCOUNT.id),
      ]);
    }
    const remoteResourceEnable = <boolean>vscode.workspace.getConfiguration().get('aliyun.fc.remoteResource.enable');
    if (!remoteResourceEnable) {
      return Promise.resolve([]);
    }
    return this.getRemoteResource(element);
  }

  private async getRemoteResource(element: Resource | undefined): Promise<Resource[]> {
    if (!element) {
      return await this.getRemoteServiceResource();
    }
    if (element.resourceType === ResourceType.Service) {
      return await this.getRemoteFunctionResource(element as ServiceResource);
    }
    if (element.resourceType === ResourceType.Function) {
      return await this.getRemoteTriggerResource(element as FunctionResource);
    }
    return [];
  }

  private async getRemoteServiceResource(): Promise<Resource[]> {
    const services = await this.functionComputeService.listAllRemoteServices();
    if (!services || !services.length) {
      return [new CommandResource (
        serverlessCommands.FC_GOTO_CONSOLE.title,
        serverlessCommands.FC_GOTO_CONSOLE.id,
      )];
    }
    return services.map(service => (
      new ServiceResource(
        service.serviceName,
        {
          command: serverlessCommands.SHOW_REMOTE_SERVICE_INFO.id,
          title: serverlessCommands.SHOW_REMOTE_SERVICE_INFO.title,
          arguments: [service.serviceName],
        }
      )
    ));
  }

  private async getRemoteFunctionResource(element: ServiceResource): Promise<Resource[]> {
    const serviceName = element.serviceName;
    const functions = await this.functionComputeService.listAllRemoteFunctionInService(serviceName);
    return functions.map(func => (
      new FunctionResource(
        element.label,
        func.functionName,
        {
          command: serverlessCommands.SHOW_REMOTE_FUNCTION_INFO.id,
          title: serverlessCommands.SHOW_REMOTE_FUNCTION_INFO.title,
          arguments: [element.label, func.functionName],
        },
        vscode.TreeItemCollapsibleState.Collapsed,
      )
    ));
  }

  private async getRemoteTriggerResource(element: FunctionResource): Promise<Resource[]> {
    const serviceName = element.serviceName;
    const functionName = element.functionName;
    const triggers = await this.functionComputeService.listAllRemoteTriggerInFunction(serviceName, functionName);
    return triggers.map(trigger => (
      new TriggerResource(
        serviceName,
        functionName,
        trigger.triggerName,
        trigger.triggerType,
        {
          command: serverlessCommands.SHOW_REMOTE_TRIGGER_INFO.id,
          title: serverlessCommands.SHOW_REMOTE_TRIGGER_INFO.title,
          arguments: [serviceName, functionName, trigger.triggerName, trigger.triggerType],
        }
      )
    ));
  }
}
