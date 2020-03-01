import * as vscode from 'vscode';
import * as path from 'path';
import * as util from 'util';
import * as glob from 'glob';
import {
  ALIYUN_SERVERLESS_SERVICE_TYPE,
  ALIYUN_SERVERLESS_FUNCTION_TYPE,
  serverlessCommands,
  ALIYUN_SERVERLESS_EVENT_TYPES,
  ALIYUN_SERVERLESS_FLOW_TYPE,
} from '../utils/constants';
import {
  Resource,
  ServiceResource,
  FunctionResource,
  ResourceType,
  TriggerResource,
  NasResource,
  TemplateResource,
  FlowResource
} from '../models/resource';
import { templateChangeEventEmitter } from '../models/events';
import { TemplateService } from '../services/TemplateService';

const findFile = util.promisify(glob);

export class LocalResourceProvider implements vscode.TreeDataProvider<Resource> {
  _onDidChangeTreeData: vscode.EventEmitter<Resource | undefined> = new vscode.EventEmitter<Resource | undefined>();
  onDidChangeTreeData: vscode.Event<Resource | undefined> = this._onDidChangeTreeData.event;
  onDidChangeTemplateContent: vscode.Event<string>;
  constructor(private workspaceRoot: string | undefined) {
    this.onDidChangeTemplateContent = templateChangeEventEmitter.event;
    this.onDidChangeTemplateContent(() => {
      this.refresh();
    })
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Resource): vscode.TreeItem {
    return element;
  }

  async getParent(element: Resource): Promise<Resource | undefined> {
    return;
  }

  async getChildren(element?: Resource): Promise<Resource[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No template.yml in empty workspace');
      return Promise.resolve([]);
    }

    if (!element) {
      const files = await findFile('**/template.?(packaged.){yml,yaml}', {
        cwd: this.workspaceRoot,
        ignore: [
          '**/node_modules/**/template.{yml,yaml}',
        ],
      })
      if (!files || !files.length) {
        return [];
      }
      if (files.length === 1) {
        return [
          new TemplateResource(
            path.resolve(this.workspaceRoot as string, files[0]),
            {
              title: serverlessCommands.GOTO_TEMPLATE.title,
              command: serverlessCommands.GOTO_TEMPLATE.id,
              arguments: [path.resolve(this.workspaceRoot as string, files[0])],
            },
            vscode.TreeItemCollapsibleState.Expanded,
          ),
        ];
      }
      return files.sort((a, b) => a.length <= b.length ? -1 : 1).map(file => {
        return new TemplateResource(
          path.resolve(this.workspaceRoot as string, file),
          {
            title: serverlessCommands.GOTO_TEMPLATE.title,
            command: serverlessCommands.GOTO_TEMPLATE.id,
            arguments: [path.resolve(this.workspaceRoot as string, file)],
          },
        );
      });
    }

    return await this.getResourceInTpl(element);
  }

  private async getResourceInTpl(element: Resource): Promise<Resource[]> {
    if (element.resourceType === ResourceType.Template) {
      return [
        ...await this.getServiceResourceInTpl(element as TemplateResource),
        ...await this.getFlowResourceInTpl(element as TemplateResource),
      ]
    }
    if (element.resourceType === ResourceType.Service) {
      return [
        ...await this.getFunctionResourceInTpl(element as ServiceResource),
        ...await this.getNasResourceInTpl(element as ServiceResource),
      ]
    }
    if (element.resourceType === ResourceType.Function) {
      return await this.getTriggerResourceInTpl(element as FunctionResource);
    }
    return [];
  }

  private async getServiceResourceInTpl(element: TemplateResource): Promise<ServiceResource[]> {
    const templateService = new TemplateService(element.templatePath);
    const tpl = await templateService.getTemplateDefinition();
    if (!tpl || !tpl.Resources) {
      return [];
    }
    const services = Object.entries(tpl.Resources)
      .filter(([_, resource]) => {
        return (<any>resource).Type === ALIYUN_SERVERLESS_SERVICE_TYPE
      })
      .map(([name]) => new ServiceResource(
        name,
        {
          title: serverlessCommands.GOTO_SERVICE_DEFINITION.title,
          command: serverlessCommands.GOTO_SERVICE_DEFINITION.id,
          arguments: [name, element.templatePath],
        },
        element.templatePath,
      ));
    return services;
  }

  private async getFunctionResourceInTpl(element: ServiceResource): Promise<FunctionResource[]> {
    const serviceName = element.serviceName;
    const templateService = new TemplateService(element.templatePath as string);
    const tpl = await templateService.getTemplateDefinition();;
    if (!tpl || !tpl.Resources) {
      return [];
    }
    const services = Object.entries(tpl.Resources)
      .filter(([name, resource]) => {
        return name === serviceName && (<any>resource).Type === ALIYUN_SERVERLESS_SERVICE_TYPE
      });
    if (!this.checkResourceUnique(serviceName, services)) {
      return [];
    }
    const functions = Object.entries((<any>services)[0][1])
      .filter(([_, resource]) => {
        return (<any>resource).Type === ALIYUN_SERVERLESS_FUNCTION_TYPE
      })
      .map(([name]) => {
        return new FunctionResource(
          serviceName,
          name,
          {
            command: serverlessCommands.GOTO_FUNCTION_DEFINITION.id,
            title: serverlessCommands.GOTO_FUNCTION_DEFINITION.title,
            arguments: [serviceName, name, element.templatePath],
          },
          this.getTriggerResourceInTpl(
            new FunctionResource(serviceName, name, undefined, undefined, element.templatePath)
          ).length > 0 ?
            vscode.TreeItemCollapsibleState.Collapsed
            :
            vscode.TreeItemCollapsibleState.None,
          element.templatePath,
        )
      })
    return functions;
  }

  private async getNasResourceInTpl(element: ServiceResource): Promise<NasResource[]> {
    const serviceName = element.serviceName;
    const templateService = new TemplateService(element.templatePath as string);
    const tpl = await templateService.getTemplateDefinition();;
    if (!tpl || !tpl.Resources) {
      return [];
    }
    const services = Object.entries(tpl.Resources)
      .filter(([name, resource]) => {
        return name === serviceName && (<any>resource).Type === ALIYUN_SERVERLESS_SERVICE_TYPE
      });
    if (!this.checkResourceUnique(serviceName, services)) {
      return [];
    }
    if (!Object.keys((<any>services)[0][1]).includes('Properties')
      || typeof (<any>services[0][1]).Properties !== 'object'
      || !Object.keys((<any>services[0][1]).Properties).includes('NasConfig')
    ) {
      return [];
    }
    if (typeof (<any>services[0][1]).Properties.NasConfig === 'string') {
      return (<any>services[0][1]).Properties.NasConfig === 'Auto' ?
        [
          new NasResource(
            serviceName,
            'auto-default',
            'Auto',
            {
              command: serverlessCommands.GOTO_NAS_DEFINITION.id,
              title: serverlessCommands.GOTO_NAS_DEFINITION.title,
              arguments: [serviceName, 'Auto', element.templatePath],
            },
            element.templatePath,
          )
        ]
        :
        [];
    }
    if (
      typeof (<any>services[0][1]).Properties.NasConfig !== 'object'
      || !Object.keys((<any>services[0][1]).Properties.NasConfig).includes('MountPoints')
      || !((<any>services[0][1]).Properties.NasConfig.MountPoints instanceof Array)
    ) {
      return [];
    }


    const result = (<any>services[0][1]).Properties.NasConfig.MountPoints
      .filter((mountPoint: any) => mountPoint
        && mountPoint.ServerAddr
        && mountPoint.MountDir
        && typeof mountPoint.ServerAddr === 'string'
        && typeof mountPoint.MountDir === 'string'
      )
      .map((mountPoint: any) => (
        new NasResource(
          serviceName,
          mountPoint.ServerAddr,
          mountPoint.MountDir,
          {
            command: serverlessCommands.GOTO_NAS_DEFINITION.id,
            title: serverlessCommands.GOTO_NAS_DEFINITION.title,
            arguments: [serviceName, mountPoint.MountDir, element.templatePath],
          },
          element.templatePath,
        )
      ));
    return result;
  }

  private getTriggerResourceInTpl(element: FunctionResource): TriggerResource[] {
    const serviceName = element.serviceName;
    const functionName = element.functionName;
    const templateService = new TemplateService(element.templatePath as string);
    const tpl = templateService.getTemplateDefinitionSync();;
    if (!tpl || !tpl.Resources) {
      return [];
    }
    const services = Object.entries(tpl.Resources)
      .filter(([name, resource]) => {
        return name === serviceName && (<any>resource).Type === ALIYUN_SERVERLESS_SERVICE_TYPE
      });
    if (!this.checkResourceUnique(serviceName, services)) {
      return [];
    }
    const functions = Object.entries((<any>services)[0][1])
      .filter(([name, resource]) => {
        return name === functionName && (<any>resource).Type === ALIYUN_SERVERLESS_FUNCTION_TYPE
      });
    if (!this.checkResourceUnique(`${serviceName}/${functionName}`, services)) {
      return [];
    }
    if (!Object.keys((<any>functions)[0][1]).includes('Events')) {
      return [];
    }
    const triggers = Object.entries((<any>functions[0][1]).Events)
      .filter(([_, resource]) =>
        (<any>resource).Type && ALIYUN_SERVERLESS_EVENT_TYPES.includes((<any>resource).Type)
      )
      .map(([name, resource]) => (
        new TriggerResource(
          serviceName,
          functionName,
          name,
          triggerTypeMapping[(<any>resource).Type],
          {
            command: serverlessCommands.GOTO_TRIGGER_DEFINITION.id,
            title: serverlessCommands.GOTO_TRIGGER_DEFINITION.title,
            arguments: [serviceName, functionName, name, element.templatePath],
          },
          element.templatePath,
        )
      ))
    return triggers;
  }

  private async getFlowResourceInTpl(element: TemplateResource): Promise<FlowResource[]> {
    const templateService = new TemplateService(element.templatePath);
    const tpl = await templateService.getTemplateDefinition();
    if (!tpl || !tpl.Resources) {
      return [];
    }
    const flows = Object.entries(tpl.Resources)
      .filter(([_, resource]) => {
        return (<any>resource).Type === ALIYUN_SERVERLESS_FLOW_TYPE
      })
      .map(([name]) => new FlowResource(
        name,
        {
          title: serverlessCommands.GOTO_FLOW_DEFINITION.title,
          command: serverlessCommands.GOTO_FLOW_DEFINITION.id,
          arguments: [name, element.templatePath],
        },
        vscode.TreeItemCollapsibleState.None,
        element.templatePath,
      ));
    return flows;
  }

  private checkResourceUnique(resourceName: string, resources: any) {
    if (resources.length === 0) {
      vscode.window.showInformationMessage(`Did not found ${resourceName} in template.yml`);
      return false;
    }
    if (resources.length > 1) {
      vscode.window.showInformationMessage(`Found more than 1 ${resourceName} in template.yml`);
      return false;
    }
    return true;
  }
}


const triggerTypeMapping: { [key: string]: string } = {
  'Timer': 'timer',
  'HTTP': 'http',
  'Log': 'log',
  'OSS': 'oss',
  'RDS': 'rds',
  'MNSTopic': 'mns_topic',
  'TableStore': 'tablestore',
  'CDN': 'cdn_events'
};
