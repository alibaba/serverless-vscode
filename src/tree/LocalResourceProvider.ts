import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as yaml from 'js-yaml';
import {
  ALIYUN_SERVERLESS_SERVICE_TYPE,
  ALIYUN_SERVERLESS_FUNCTION_TYPE,
  serverlessCommands,
  ALIYUN_SERVERLESS_EVENT_TYPES,
} from '../utils/constants';
import { isPathExists } from '../utils/file';
import {
  Resource,
  ServiceResource,
  FunctionResource,
  ResourceType,
  TriggerResource,
  NasResource
} from '../models/resource';

const readFile = util.promisify(fs.readFile);

export class LocalResourceProvider implements vscode.TreeDataProvider<Resource> {
  _onDidChangeTreeData: vscode.EventEmitter<Resource | undefined> = new vscode.EventEmitter<Resource | undefined>();
  onDidChangeTreeData: vscode.Event<Resource | undefined> = this._onDidChangeTreeData.event;

  tpl: Tpl = {};
  tplHasLoaded: boolean = false;

  constructor(private workspaceRoot: string | undefined) {

  }

  refresh(): void {
    this.tplHasLoaded = false;
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Resource): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Resource): Thenable<Resource[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No template.yml in empty workspace');
      return Promise.resolve([]);
    }
    const tplPath = path.join(this.workspaceRoot, 'template.yml');
    if (!isPathExists(tplPath)) {
      vscode.window.showInformationMessage('No template.yml in current workspace');
      return Promise.resolve([]);
    }

    if (this.tplHasLoaded) {
      return Promise.resolve(
        this.getResourceInTpl(element)
      )
    } else {
      return Promise.resolve(
        this.getTpl(tplPath)
          .then(tpl => {
            this.tpl = tpl;
            this.tplHasLoaded = true;
            return Promise.resolve(this.getResourceInTpl(element));
          })
      )
    }
  }

  private async getTpl(tplPath: string): Promise<object> {
    const tplContent = await readFile(tplPath, 'utf8');
    const tpl = yaml.safeLoad(tplContent);
    return tpl;
  }

  private getResourceInTpl(element?: Resource): Resource[] {
    if (!element) {
      return this.getServiceResourceInTpl();
    }
    if (element.resourceType === ResourceType.Service) {
      return [
        ...this.getFunctionResourceInTpl((element as ServiceResource).serviceName),
        ...this.getNasResourceInTpl((element as ServiceResource).serviceName),
      ]
    }
    if (element.resourceType === ResourceType.Function) {
      return this.getTriggerResourceInTpl(
        (element as FunctionResource).serviceName,
        (element as FunctionResource).functionName
      );
    }
    return [];
  }

  private getServiceResourceInTpl(): ServiceResource[] {
    const tpl = this.tpl;
    if (!tpl || !tpl.Resources) {
      return [];
    }
    const services = Object.entries(tpl.Resources)
      .filter(([_, resource]) => {
        return resource.Type === ALIYUN_SERVERLESS_SERVICE_TYPE
      })
      .map(([name]) => new ServiceResource(name,
        {
          title: serverlessCommands.GOTO_SERVICE_TEMPLATE.title,
          command: serverlessCommands.GOTO_SERVICE_TEMPLATE.id,
          arguments: [name],
        })
      );
    return services;
  }

  private getFunctionResourceInTpl(serviceName: string): FunctionResource[] {
    const tpl = this.tpl;
    if (!tpl || !tpl.Resources) {
      return [];
    }
    const services = Object.entries(tpl.Resources)
      .filter(([name, resource]) => {
        return name === serviceName && resource.Type === ALIYUN_SERVERLESS_SERVICE_TYPE
      });
    if (!this.checkResourceUnique(serviceName, services)) {
      return [];
    }
    const functions = Object.entries(services[0][1])
      .filter(([_, resource]) => {
        return resource.Type === ALIYUN_SERVERLESS_FUNCTION_TYPE
      })
      .map(([name]) => {
        return new FunctionResource(
          serviceName,
          name,
          {
            command: serverlessCommands.GOTO_FUNCTION_TEMPLATE.id,
            title: serverlessCommands.GOTO_FUNCTION_TEMPLATE.title,
            arguments: [serviceName, name],
          },
          this.getTriggerResourceInTpl(serviceName, name).length > 0
            ? vscode.TreeItemCollapsibleState.Collapsed
            : vscode.TreeItemCollapsibleState.None,
        )
      })
    return functions;
  }

  private getNasResourceInTpl(serviceName: string): NasResource[] {
    const tpl = this.tpl;
    if (!tpl || !tpl.Resources) {
      return [];
    }
    const services = Object.entries(tpl.Resources)
      .filter(([name, resource]) => {
        return name === serviceName && resource.Type === ALIYUN_SERVERLESS_SERVICE_TYPE
      });
    if (!this.checkResourceUnique(serviceName, services)) {
      return [];
    }
    if (!Object.keys(services[0][1]).includes('Properties')
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
              command: serverlessCommands.GOTO_NAS_TEMPLATE.id,
              title: serverlessCommands.GOTO_NAS_TEMPLATE.title,
              arguments: [serviceName, 'Auto'],
            }
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
            command: serverlessCommands.GOTO_NAS_TEMPLATE.id,
            title: serverlessCommands.GOTO_NAS_TEMPLATE.title,
            arguments: [serviceName, mountPoint.MountDir],
          }
        )
      ));
    return result;
  }

  private getTriggerResourceInTpl(serviceName: string, functionName: string): TriggerResource[] {
    const tpl = this.tpl;
    if (!tpl || !tpl.Resources) {
      return [];
    }
    const services = Object.entries(tpl.Resources)
      .filter(([name, resource]) => {
        return name === serviceName && resource.Type === ALIYUN_SERVERLESS_SERVICE_TYPE
      });
    if (!this.checkResourceUnique(serviceName, services)) {
      return [];
    }
    const functions = Object.entries(services[0][1])
      .filter(([name, resource]) => {
        return name === functionName && resource.Type === ALIYUN_SERVERLESS_FUNCTION_TYPE
      });
    if (!this.checkResourceUnique(`${serviceName}/${functionName}`, services)) {
      return [];
    }
    if (!Object.keys(functions[0][1]).includes('Events')) {
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
          (<any>resource).Type,
          {
            command: serverlessCommands.GOTO_TRIGGER_TEMPLATE.id,
            title: serverlessCommands.GOTO_TRIGGER_TEMPLATE.title,
            arguments: [serviceName, functionName, name],
          }
        )
      ))
    return triggers;
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
