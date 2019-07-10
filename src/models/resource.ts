import * as vscode from 'vscode';
import * as path from 'path';

export enum ResourceType {
  Service = 0,
  Function = 1,
  Trigger = 2,
  None = 99,
}

export class Resource extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly resourceType: ResourceType,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly resourceProperties?: ResourceProperties,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
  }

  iconPath = {
    light: path.join(__filename, '..', '..', '..', 'media', 'light', this.getIconName()),
    dark: path.join(__filename, '..', '..', '..', 'media', 'dark', this.getIconName()),
  };

  getIconName(): string {
    if (this.resourceType === ResourceType.Service) {
      return 'box.svg';
    }
    if (this.resourceType === ResourceType.Function) {
      return 'function.svg';
    }
    return '';
  }

  convertResourceType2ContextValue(resourceType: ResourceType) {
    if (resourceType === ResourceType.Service) {
      return 'service';
    }
    if (resourceType === ResourceType.Function) {
      return 'function';
    }
    return '';
  }

  contextValue = this.convertResourceType2ContextValue(this.resourceType);
}

export class ResourceProperties {
  [key: string]: string;
}
