import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as yaml from 'js-yaml';
import { isPathExists } from '../utils/file';
import { Resource, ResourceType } from '../models/resource';

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
        this.getResourceInTpl(this.tpl, element)
      )
    } else {
      return Promise.resolve(
        this.getTpl(tplPath)
          .then(tpl => {
            this.tpl = tpl;
            this.tplHasLoaded = true;
            return Promise.resolve(this.getResourceInTpl(this.tpl, element));
          })
      )
    }
  }

  private async getTpl(tplPath: string): Promise<object> {
    const tplContent = await readFile(tplPath, 'utf8');
    const tpl = yaml.safeLoad(tplContent);
    return tpl;
  }

  private getResourceInTpl(tpl: Tpl, element?: Resource): Resource[] {
    if (!tpl || !tpl.Resources) {
      return [];
    }
    if (!element) {
      const services = Object.entries(tpl.Resources)
        .filter(([_, resource]) => { 
          return resource.Type === 'Aliyun::Serverless::Service'
        })
        .map(([name]) => new Resource(
          name,
          ResourceType.Service,
          vscode.TreeItemCollapsibleState.Collapsed,
          {},
          {
            title: 'goto',
            command: 'fc.extension.localResource.service.gotoTemplate',
            arguments: [name],
          }
        ));
      return services;
    }
    const serviceName = element.label;
    const services = Object.entries(tpl.Resources)
        .filter(([name]) => {
          return name === serviceName
        })
    if (services.length === 0) {
      vscode.window.showInformationMessage(`Did not found service ${serviceName} in template.yml`);
      return [];
    } 
    if (services.length > 1) {
      vscode.window.showInformationMessage(`Found more than 1 service ${serviceName} in template.yml`);
      return [];
    }
    const functions = Object.entries(services[0][1])
      .filter(([name, resource]) => {
        return resource.Type === 'Aliyun::Serverless::Function'
      })
      .map(([name, resource]) => {
        return new Resource(
          name,
          ResourceType.Function,
          vscode.TreeItemCollapsibleState.None,
          {
            serviceName,
            functionType: (<any>resource).Events && (<any>resource).Events.HttpTrigger ? 'HTTP' : 'NORMAL',
          },
          {
            title: 'goto',
            command: 'fc.extension.localResource.function.gotoTemplate',
            arguments: [serviceName, name],
          }
        )
      })

    return functions;
  }
}