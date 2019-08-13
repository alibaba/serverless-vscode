import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import { serverlessCommands } from '../utils/constants';
import { isPathExists } from '../utils/file';
import { Resource, CommandResource, ServiceResource, FunctionResource } from '../models/resource';
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
    if (!element) {
      return Promise.resolve(
        this.functionComputeService.listAllRemoteServices()
          .then(services => services.map(service => (
            new ServiceResource(
              service.serviceName,
              {
                command: serverlessCommands.SHOW_REMOTE_SERVICE_INFO.id,
                title: serverlessCommands.SHOW_REMOTE_SERVICE_INFO.title,
                arguments: [service.serviceName],
              }
            )))
          )
      );
    }
    return Promise.resolve(
      this.functionComputeService.listAllRemoteFunctionInService(element.label)
        .then(functions => functions.map(func => (
          new FunctionResource(
            element.label,
            func.functionName,
            {
              command: serverlessCommands.SHOW_REMOTE_FUNCTION_INFO.id,
              title: serverlessCommands.SHOW_REMOTE_FUNCTION_INFO.title,
              arguments: [element.label, func.functionName],
            }
          )
        )))
    );
  }
}
