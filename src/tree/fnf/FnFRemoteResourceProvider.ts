import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import { isPathExists } from '../../utils/file';
import { serverlessCommands } from '../../utils/constants';
import {
  Resource,
  CommandResource,
  FlowResource,
  ExecutionResource,
  ResourceType,
} from '../../models/resource';
import { FunctionFlowService } from '../../services/FunctionFlowService';

export class FnFRemoteResourceProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  _onDidChangeTreeData: vscode.EventEmitter<Resource | undefined> = new vscode.EventEmitter<Resource | undefined>();
  onDidChangeTreeData: vscode.Event<Resource | undefined> = this._onDidChangeTreeData.event;
  functionflowService: FunctionFlowService = new FunctionFlowService();

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
    return this.getRemoteResource(element);
  }

  private async getRemoteResource(element: Resource | undefined): Promise<Resource[]> {
    if (!element) {
      return await this.getRemoteFlowResource();
    }
    if (element.resourceType === ResourceType.Flow) {
      return await this.getRemoteExecutionResource(element as FlowResource);
    }
    return [];
  }

  private async getRemoteFlowResource(): Promise<Resource[]> {
    const flows = await this.functionflowService.listAllRemoteFlows();
    const result = flows.map((flow: any) => (
      new FlowResource(
        flow.Name,
      )
    ));
    if (result.length === 0) {
      return [new CommandResource(serverlessCommands.FNF_GOTO_CONSOLE.title, serverlessCommands.FNF_GOTO_CONSOLE.id)];
    }
    return result;
  }

  private async getRemoteExecutionResource(element: FlowResource): Promise<Resource[]> {
    const flowName = element.flowName;
    const executions = await this.functionflowService.listAllRemoteExecutions(flowName);
    return executions.map((execution: any) => (
      new ExecutionResource(
        flowName,
        execution.Name,
      )
    ));
  }
}
