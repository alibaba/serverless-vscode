import * as vscode from 'vscode';
import * as path from 'path';
import { ext } from '../extensionVariables';

export enum ResourceType {
  Service = 0,
  Function = 1,
  Trigger = 2,
  Nas = 3,
  Flow = 10,
  Execution = 11,
  Template = 98,
  Command = 99,
}

export class Resource extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly resourceType: ResourceType,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
  }
}

export class CommandResource extends Resource {
  constructor(title: string, command: string) {
    super(
      title,
      ResourceType.Command,
      vscode.TreeItemCollapsibleState.None,
      {
        title,
        command,
      },
    );
    this.contextValue = 'command';
  }
}

export class TemplateResource extends Resource {
  templatePath: string;
  constructor(
    templatePath: string,
    command?: vscode.Command,
    collapsibleState?: vscode.TreeItemCollapsibleState,
  ) {
    const templatePaths = templatePath.split(path.sep);
    super(
      templatePaths[templatePaths.length - 1],
      ResourceType.Template,
      collapsibleState || vscode.TreeItemCollapsibleState.Collapsed,
      command,
    );
    this.description = path.relative(ext.cwd as string, templatePath);
    const prefix = this.description.split(path.sep).length > 1 ? `.${path.sep}` : ''
    this.description = prefix + this.description.substring(0, this.description.lastIndexOf(path.sep));
    this.templatePath = templatePath;
    this.contextValue = 'template';
  }
}

export class ServiceResource extends Resource {
  serviceName: string;
  templatePath: string | undefined;
  constructor(
    serviceName: string,
    command?: vscode.Command,
    templatePath?: string,
  ) {
    super(
      serviceName,
      ResourceType.Service,
      vscode.TreeItemCollapsibleState.Collapsed,
      command,
    );
    this.serviceName = serviceName;
    this.templatePath = templatePath;
    this.iconPath = {
      light: path.resolve(__dirname, '..', '..', 'media', 'light', 'box.svg'),
      dark: path.resolve(__dirname, '..', '..', 'media', 'dark', 'box.svg'),
    }
    this.contextValue = 'service';
  }
}

export class NasResource extends Resource {
  serviceName: string;
  serverAddr: string;
  mountDir: string;
  templatePath: string | undefined;
  constructor(
    serviceName: string,
    serverAddr: string,
    mountDir: string,
    command?: vscode.Command,
    templatePath?: string,
  ) {
    super(
      mountDir === 'Auto' ? 'nas:///mnt/auto' : `nas://${mountDir}`,
      ResourceType.Nas,
      vscode.TreeItemCollapsibleState.None,
      command,
    );
    this.serviceName = serviceName;
    this.templatePath = templatePath;
    this.serverAddr = serverAddr;
    this.mountDir = mountDir;
    this.iconPath = {
      light: path.resolve(__dirname, '..', '..', 'media', 'light', 'nas.svg'),
      dark: path.resolve(__dirname, '..', '..', 'media', 'dark', 'nas.svg'),
    }
    this.contextValue = 'nas';
  }
}

export class FunctionResource extends Resource {
  serviceName: string;
  functionName: string;
  templatePath: string | undefined;
  constructor(
    serviceName: string,
    functionName: string,
    command?: vscode.Command,
    collapsibleState?: vscode.TreeItemCollapsibleState,
    templatePath?: string,
  ) {
    super(
      functionName,
      ResourceType.Function,
      collapsibleState || vscode.TreeItemCollapsibleState.None,
      command,
    );
    this.serviceName = serviceName;
    this.functionName = functionName;
    this.templatePath = templatePath;
    this.iconPath = {
      light: path.resolve(__dirname, '..', '..', 'media', 'light', 'function.svg'),
      dark: path.resolve(__dirname, '..', '..', 'media', 'dark', 'function.svg'),
    }
    this.contextValue = 'function';
  }
}

export class TriggerResource extends Resource {
  serviceName: string;
  functionName: string;
  triggerName: string;
  triggerType: string;
  templatePath: string | undefined;
  constructor(
    serviceName: string,
    functionName: string,
    triggerName: string,
    triggerType: string,
    command?: vscode.Command,
    templatePath?: string,
  ) {
    super(
      triggerName,
      ResourceType.Trigger,
      vscode.TreeItemCollapsibleState.None,
      command,
    );
    this.serviceName = serviceName;
    this.functionName = functionName;
    this.templatePath = templatePath;
    this.triggerName = triggerName;
    this.triggerType = triggerType;
    this.iconPath = {
      light: path.resolve(__dirname, '..', '..', 'media', 'light', triggerType + '.svg'),
      dark: path.resolve(__dirname, '..', '..', 'media', 'dark', triggerType + '.svg'),
    }
    this.contextValue = 'trigger';
  }
}

export class FlowResource extends Resource {
  flowName: string;
  constructor(
    flowName: string,
    command?: vscode.Command,
  ) {
    super(
      flowName,
      ResourceType.Flow,
      vscode.TreeItemCollapsibleState.Collapsed,
      command,
    );
    this.flowName = flowName;
    this.iconPath = {
      light: path.resolve(__dirname, '..', '..', 'media', 'light', 'flow.svg'),
      dark: path.resolve(__dirname, '..', '..', 'media', 'dark', 'flow.svg'),
    }
    this.contextValue = 'flow';
  }
}

export class ExecutionResource extends Resource {
  flowName: string;
  executionName: string;
  constructor(
    flowName: string,
    executionName: string,
    command?: vscode.Command,
  ) {
    super(
      executionName,
      ResourceType.Flow,
      vscode.TreeItemCollapsibleState.None,
      command,
    );
    this.flowName = flowName;
    this.executionName = executionName;
    this.iconPath = {
      light: path.resolve(__dirname, '..', '..', 'media', 'light', 'execution.svg'),
      dark: path.resolve(__dirname, '..', '..', 'media', 'dark', 'execution.svg'),
    }
    this.contextValue = 'execution';
  }
}
