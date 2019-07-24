import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import { serverlessCommands } from '../utils/constants';
import { isPathExists } from '../utils/file';
import { Resource, ResourceType } from '../models/resource';
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
        new Resource(
          'Bind New Account...',
          ResourceType.None,
          vscode.TreeItemCollapsibleState.None,
          {},
          {
            title: serverlessCommands.BIND_ACCOUNT.title,
            command: serverlessCommands.BIND_ACCOUNT.id,
          },
        ),
      ]);
    }
    const remoteResourceEnable = <boolean>vscode.workspace.getConfiguration().get('aliyun.fc.remoteSource.enable');
    if (!remoteResourceEnable) {
      return Promise.resolve([]);
    }
    if (!element) {
      return Promise.resolve(
        this.functionComputeService.listAllRemoteServices()
          .then(services => services.map(service => (new Resource(
            service.serviceName,
            ResourceType.Service,
            vscode.TreeItemCollapsibleState.Collapsed,
            {},
            {
              title: 'Show Service Info',
              command: serverlessCommands.SHOW_REMOTE_SERVICE_INFO.id,
              arguments: [service.serviceName],
            }
          ))))
      );
    }
    return Promise.resolve(
      this.functionComputeService.listAllRemoteFunctionInService(element.label)
        .then(functions => functions.map(func => (new Resource(
          func.functionName,
          ResourceType.Function,
          vscode.TreeItemCollapsibleState.None,
          {
            serviceName: element.label,
            ...func
          },
          {
            title: 'Show Function Info',
            command: serverlessCommands.SHOW_REMOTE_FUNCTION_INFO.id,
            arguments: [element.label, func.functionName],
          }
        ))))
    );
  }
}
