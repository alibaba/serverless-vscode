import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import * as glob from 'glob';
import { ext } from '../extensionVariables';
import { FunctionDescriptor } from '../descriptors/descriptor';
import { AbstractFlowPanelCreator } from './AbstractFlowPanelCreator';
import { getOrInitEventConfig } from '../utils/localConfig';
import { isPathExists, createEventFile } from '../utils/file';
import { FunctionComputeService } from '../services/FunctionComputeService';
import { serverlessCommands } from '../utils/constants';
import { FunctionResource } from '../models/resource';

const findFile = util.promisify(glob);

export class FunctionInfoPanelCreator extends AbstractFlowPanelCreator<FunctionDescriptor> {
  viewType = 'functionInfo';

  public constructor(extensionPath: string) {
    super(extensionPath);
  }

  public getPanelTitle(descriptor: FunctionDescriptor): string {
    return `${descriptor.serviceName}/${descriptor.functionName}`;
  }

  protected receiveMessage(message: any, descriptor: FunctionDescriptor, panel: vscode.WebviewPanel) {
    switch (message.command) {
      case 'describeInitialEntry': {
        this.describeInitialEntry(message, descriptor, panel);
        return;
      }
      case 'vs/getWorkspaceState': {
        this.getWorkspaceState(message, descriptor, panel);
        return;
      }
      case 'fc/getEventFileList': {
        this.getEventFileList(message, descriptor, panel);
        return;
      }
      case 'fc/getEventContent': {
        this.getEventContent(message, descriptor, panel);
        return;
      }
      case 'fc/getFunction': {
        this.getFunction(message, descriptor, panel);
        return;
      }
      case 'fc/remoteInvoke': {
        this.remoteInvoke(message, descriptor, panel);
        return;
      }
      case 'fc/updateEventContent': {
        this.updateEventContent(message, descriptor, panel);
        return;
      }
    }
  }

  public describeInitialEntry(message: any, descriptor: FunctionDescriptor, panel: vscode.WebviewPanel) {
    panel.webview.postMessage({
      id: message.id,
      data: {
        entry: `/fc/services/item/${descriptor.serviceName}/functions/item/${descriptor.functionName}`,
      },
    });
  }

  public async getFunction(message: any, descriptor: FunctionDescriptor, panel: vscode.WebviewPanel) {
    const functionComputeService = new FunctionComputeService();
    const functionInfo = await functionComputeService.getFunction(descriptor.serviceName, descriptor.functionName);
    const functionBaseInfo: any = {
      ...functionInfo,
      serviceName: descriptor.serviceName,
      regionId: functionComputeService.getRegion(),
    };
    panel.webview.postMessage({
      id: message.id,
      data: functionBaseInfo,
    });
  }


  public getWorkspaceState(message: any, descriptor: FunctionDescriptor, panel: vscode.WebviewPanel) {
    panel.webview.postMessage({
      id: message.id,
      data: {
        opened: !!ext.cwd,
      },
    });
  }

  public async getDefaultEventFilePath(descriptor: FunctionDescriptor) {
    return await getOrInitEventConfig(
      path.resolve(ext.cwd as string, 'template.yml'),
      descriptor.serviceName,
      descriptor.functionName,
      path.join(descriptor.serviceName, descriptor.functionName),
    );
  }

  public async generateEventFilePath(descriptor: FunctionDescriptor, eventFileName: string) {
    const defaultEventFilePath = await this.getDefaultEventFilePath(descriptor);
    return path.resolve(path.dirname(defaultEventFilePath), eventFileName);
  }

  public async getEventFileList(message: any, descriptor: FunctionDescriptor, panel: vscode.WebviewPanel) {
    if (!ext.cwd) {
      panel.webview.postMessage({
        id: message.id,
        data: {
          fileList: [],
        },
      });
      return;
    }
    const eventFilePath = await this.getDefaultEventFilePath(descriptor);
    if (!isPathExists(eventFilePath)) {
      if (!createEventFile(eventFilePath)) {
        throw new Error(`Create ${eventFilePath} event file failed`);
      }
    }
    const files = await findFile('*.evt', {
      cwd: path.dirname(eventFilePath),
    })
    panel.webview.postMessage({
      id: message.id,
      data: {
        fileList: files,
        defaultFile: path.basename(eventFilePath),
      },
    });
  }

  public async getEventContent(message: any, descriptor: FunctionDescriptor, panel: vscode.WebviewPanel) {
    if (!ext.cwd) {
      panel.webview.postMessage({
        id: message.id,
        data: {
          content: '',
        },
      });
      return;
    }
    const { eventFile } = message;
    const eventFilePath = await this.generateEventFilePath(descriptor, eventFile);
    const content = fs.readFileSync(eventFilePath, 'utf8');
    panel.webview.postMessage({
      id: message.id,
      data: {
        content: content,
      },
    });
  }


  public async remoteInvoke(message: any, descriptor: FunctionDescriptor, panel: vscode.WebviewPanel) {
    const { eventFile } = message;
    let eventFilePath = '';
    if (ext.cwd && eventFile) {
      eventFilePath = await this.generateEventFilePath(descriptor, eventFile);
    }
    vscode.commands.executeCommand(
      serverlessCommands.REMOTE_INVOKE.id,
      new FunctionResource(descriptor.serviceName, descriptor.functionName),
      eventFilePath,
    );
    panel.webview.postMessage({
      id: message.id,
      data: {},
    });
  }

  public async updateEventContent(message: any, descriptor: FunctionDescriptor, panel: vscode.WebviewPanel) {
    const { eventFile, content = '' } = message;
    if (!eventFile) {
      return;
    }
    const eventFilePath = await this.generateEventFilePath(descriptor, eventFile);
    fs.writeFileSync(eventFilePath, content);
    panel.webview.postMessage({
      id: message.id,
      data: {},
    });
    return;
  }
}
