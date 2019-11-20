import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as yaml from 'js-yaml';
import { isPathExists } from '../../utils/file';
import { serverlessCommands } from '../../utils/constants';
import {
  Resource,
  CommandResource,
  FlowResource,
  ExecutionResource,
  ResourceType,
  FlowDirectoryResource,
  FlowStepResource,
  FlowExecDirectoryResource,
  FlowDefDirectoryResource,
} from '../../models/resource';
import { FunctionFlowService } from '../../services/FunctionFlowService';

const stepTypesWithSubStep = ['flow', 'choice', 'parallel', 'foreach', 'loop'];
const stepTypesWithEnd = ['succeed', 'fail'];

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
    return this.getRemoteResource(element)
      .catch(() =>
        [new CommandResource(serverlessCommands.FNF_GOTO_CONSOLE.title, serverlessCommands.FNF_GOTO_CONSOLE.id)]
      );
  }

  private async getRemoteResource(element: Resource | undefined): Promise<Resource[]> {
    if (!element) {
      return await this.getRemoteFlowResource();
    }
    if (element.resourceType === ResourceType.Flow) {
      return await this.getDirectoryResource(element as FlowResource);
    }
    if (element.resourceType === ResourceType.Directory) {
      const directoryResource = element as FlowDirectoryResource;
      if (directoryResource instanceof FlowExecDirectoryResource) {
        return await this.getRemoteExecutionResource(directoryResource);
      }
      if (directoryResource instanceof FlowDefDirectoryResource) {
        return await this.getRemoteFlowDefinitionResource(directoryResource);
      }

    }
    if (element.resourceType === ResourceType.FlowDefinition) {
      return await this.getRemoteStepDefinitionResource(element as FlowStepResource);
    }
    return [];
  }

  private async getRemoteFlowResource(): Promise<Resource[]> {
    const flows = await this.functionflowService.listAllRemoteFlows();
    const result = flows.map((flow: any) => (
      new FlowResource(
        flow.Name,
        {
          command: serverlessCommands.SHOW_REMOTE_FLOW_INFO.id,
          title: serverlessCommands.SHOW_REMOTE_FLOW_INFO.title,
          arguments: [flow.Name],
        }
      )
    ));
    if (result.length === 0) {
      return [new CommandResource(serverlessCommands.FNF_GOTO_CONSOLE.title, serverlessCommands.FNF_GOTO_CONSOLE.id)];
    }
    return result;
  }

  private async getDirectoryResource(element: FlowResource): Promise<Resource[]> {
    return [
      new FlowDefDirectoryResource(element.flowName),
      new FlowExecDirectoryResource(element.flowName),
    ]
  }

  private async getRemoteExecutionResource(element: FlowDirectoryResource): Promise<Resource[]> {
    const flowName = element.flowName;
    const executions = await this.functionflowService.listAllRemoteExecutions(flowName);
    return executions.map((execution: any) => (
      new ExecutionResource(
        flowName,
        execution.Name,
      )
    ));
  }

  private async getRemoteFlowDefinitionResource(element: FlowDirectoryResource): Promise<Resource[]> {
    const flowName = element.flowName;
    const flow: any = await this.functionflowService.describeFlow(flowName);
    if (!flow) {
      return [];
    }
    const definition = yaml.safeLoad(flow.Definition);
    const steps = definition.steps.map((step: any, index: number) => (
      new FlowStepResource(
        flowName,
        generateStepTreeItemName(step.name, step.type, step.end),
        step.type,
        step,
        stepTypesWithSubStep.includes(step.type) ?
          vscode.TreeItemCollapsibleState.Collapsed
          :
          vscode.TreeItemCollapsibleState.None,
      )
    ));
    return steps;
  }

  private async getRemoteStepDefinitionResource(element: FlowStepResource): Promise<Resource[]> {
    if (!stepTypesWithSubStep.includes(element.type)) {
      return [];
    }
    const definition = element.definition;
    const flowName = element.flowName;
    const result: Resource[] = [];
    if (element.type === 'flow'|| element.type === 'foreach' || element.type === 'loop') {
      if (definition.steps && definition.steps.length) {
        definition.steps.forEach((step: any) => {
          result.push(
            new FlowStepResource(
              flowName,
              generateStepTreeItemName(step.name, step.type, step.end),
              step.type,
              step,
              stepTypesWithSubStep.includes(step.type) ?
                vscode.TreeItemCollapsibleState.Collapsed
                :
                vscode.TreeItemCollapsibleState.None,
            )
          );
        });
      }
      if (definition.goto) {
        result.push(
          new FlowStepResource(
            flowName,
            `Goto ${definition.goto}`,
            'goto',
            undefined,
            vscode.TreeItemCollapsibleState.None,
          )
        );
      }
      return result;
    }
    if (element.type === 'choice') {
      if (definition.choices && definition.choices.length) {
        definition.choices.forEach((choice: any) => {
          result.push(
            new FlowStepResource(
              flowName,
              choice.condition,
              'flow',
              choice,
              vscode.TreeItemCollapsibleState.Collapsed,
            )
          );
        });
      }
      if (definition.default) {
        result.push(
          new FlowStepResource(
            flowName,
            'default',
            'flow',
            definition.default,
            vscode.TreeItemCollapsibleState.Collapsed,
          )
        );
      }
      return result;
    }
    if (element.type === 'parallel') {
      if (definition.branches && definition.branches.length) {
        definition.branches.forEach((branch: any, index: number) => {
          result.push(
            new FlowStepResource(
              flowName,
              `Branch${index + 1}`,
              'flow',
              branch,
              vscode.TreeItemCollapsibleState.Collapsed,
            )
          )
        });
      }
      return result;
    }
    return result;
  }
}

function generateStepTreeItemName(name: string, type: string, end: boolean) {
  return (stepTypesWithEnd.includes(type) || end) ? `${name} -> End` : name;
}
