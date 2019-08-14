import * as vscode from 'vscode';
import * as path from 'path';

export enum ResourceType {
  Service = 0,
  Function = 1,
  Trigger = 2,
  Nas = 3,
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

export class ServiceResource extends Resource {
  serviceName: string;
  constructor(
    serviceName: string,
    command?: vscode.Command,
  ) {
    super(
      serviceName,
      ResourceType.Service,
      vscode.TreeItemCollapsibleState.Collapsed,
      command,
    );
    this.serviceName = serviceName;
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
  constructor(
    serviceName: string,
    serverAddr: string,
    mountDir: string,
    command?: vscode.Command,
  ) {
    super(
      mountDir === 'Auto' ? 'nas:///mnt/auto' : `nas://${mountDir}`,
      ResourceType.Nas,
      vscode.TreeItemCollapsibleState.None,
      command,
    );
    this.serviceName = serviceName;
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
  constructor(
    serviceName: string,
    functionName: string,
    command?: vscode.Command,
    collapsibleState?: vscode.TreeItemCollapsibleState,
  ) {
    super(
      functionName,
      ResourceType.Function,
      collapsibleState || vscode.TreeItemCollapsibleState.None,
      command,
    );
    this.serviceName = serviceName;
    this.functionName = functionName;
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
  constructor(
    serviceName: string,
    functionName: string,
    triggerName: string,
    triggerType: string,
    command?: vscode.Command,
  ) {
    super(
      triggerName,
      ResourceType.Trigger,
      vscode.TreeItemCollapsibleState.None,
      command,
    );
    this.serviceName = serviceName;
    this.functionName = functionName;
    this.triggerName = triggerName;
    this.triggerType = triggerType;
    this.iconPath = {
      light: path.resolve(__dirname, '..', '..', 'media', 'light', TriggerResource.getIconName(triggerType) + '.svg'),
      dark: path.resolve(__dirname, '..', '..', 'media', 'dark', TriggerResource.getIconName(triggerType) + '.svg'),
    }
    this.contextValue = 'trigger';
  }

  private static getIconName(triggerType: string) {
    const iconMap: { [key: string]: string } = {
      'Timer': 'clock',
      'HTTP': 'http',
      'Log': 'sls',
      'RDS': 'rds',
      'MNSTopic': 'mns',
      'TableStore': 'ots',
      'OSS': 'oss',
      'CDN': 'cdn',
    };
    return iconMap[triggerType];
  }
}
